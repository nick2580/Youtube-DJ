// Demucs-in-the-browser timing spike: separate one cached song, time every stage, send the vocals back
// to serve.py so compare.py can check them against the Python helper's stems/htdemucs/<vid>/vocals.wav.
const { DemucsProcessor } = await import(new URLSearchParams(location.search).get("vox") ? "./vocals_only.js" : "./vendor/demucs-web/src/processor.js");
import { createChain } from "./chain.js";

const q = new URLSearchParams(location.search);
const ortDir = q.get("ort") || "ort";   // vendor/ort = current release, vendor/ort-1.22 = the old JSEP backend
const vid = q.get("vid"), ep = q.get("ep") || "webgpu", power = q.get("power") || "high-performance";
const secs = +(q.get("secs") || 0), model = q.get("model") || "models/htdemucs_embedded.onnx";
const tag = `${vid}.${ep}${ep === "webgpu" ? "." + power : ""}${model.endsWith(".onnx") ? "" : ".split"}${ortDir === "ort" ? "" : "." + ortDir}${q.get("vox") ? ".vox" : ""}`;
const el = document.getElementById("log");
const log = (...a) => { const s = a.join(" "); el.textContent += s + "\n"; console.log("[spike] " + s);
  fetch(`/result/${tag}.log`, { method: "POST", body: el.textContent }).catch(() => {}); };   // live progress
log("importing ort from vendor/" + ortDir);
const ort = await import(`./vendor/${ortDir}/dist/ort.webgpu.min.mjs`);
const warns = [];   // ORT reports nodes it had to put on the CPU as warnings
const _w = console.warn; console.warn = (...a) => { warns.push(a.join(" ")); _w(...a); };
const t = () => performance.now();

log("ort imported");
async function main() {
  const R = { vid, ep, power, secs, model, ua: navigator.userAgent, crossOriginIsolated, threads: navigator.hardwareConcurrency };
  R.ort = ort.env.versions?.web || ortDir;
  ort.env.wasm.wasmPaths = new URL(`./vendor/${ortDir}/dist/`, location.href).href;
  ort.env.wasm.numThreads = Math.min(8, navigator.hardwareConcurrency || 4);
  ort.env.logLevel = "warning";
  if (ep === "webgpu") {
    if (!navigator.gpu) throw new Error("no navigator.gpu");
    const ad = await navigator.gpu.requestAdapter({ powerPreference: power });
    if (!ad) throw new Error("no WebGPU adapter");
    const i = ad.info || {};
    R.adapter = { vendor: i.vendor, architecture: i.architecture, device: i.device, description: i.description };
    log("adapter", JSON.stringify(R.adapter));
    ort.env.webgpu.adapter = ad;
    ort.env.webgpu.powerPreference = power;
  }

  let t0 = t();
  const buf = await (await fetch(`/audio/${vid}.wav`)).arrayBuffer();
  const ab = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(buf);
  let L = ab.getChannelData(0), Rt = ab.numberOfChannels > 1 ? ab.getChannelData(1) : L;
  if (secs > 0) { L = L.subarray(0, secs * 44100); Rt = Rt.subarray(0, secs * 44100); }
  R.audio_s = +(L.length / 44100).toFixed(2); R.decode_ms = Math.round(t() - t0);
  log(`audio ${R.audio_s}s, decoded in ${R.decode_ms} ms`);

  const seg = [];
  let last = t();
  const proc = new DemucsProcessor({
    ort,
    sessionOptions: { executionProviders: ep === "webgpu" ? ["webgpu"] : ["wasm"], graphOptimizationLevel: "all" },
    onProgress: (p) => { const n = t(); seg.push(Math.round(n - last)); last = n; if (p.currentSegment % 5 === 1) log(`segment ${p.currentSegment}/${p.totalSegments}`); },
  });
  t0 = t();
  if (model.endsWith(".onnx")) await proc.loadModel(model);
  else proc.session = await createChain(ort, model);    // a folder = the fp16 split chain
  R.load_ms = Math.round(t() - t0); log(`model loaded in ${R.load_ms} ms`);
  // split the time between the network (session.run) and demucs-web's JS STFT/iSTFT/overlap-add
  const run = proc.session.run.bind(proc.session); let infer = 0;
  proc.session.run = async (f) => { const s = t(); const r = await run(f); infer += t() - s; return r; };

  t0 = t(); last = t0;
  const out = await proc.separate(L, Rt);
  R.separate_ms = Math.round(t() - t0); R.infer_ms = Math.round(infer); R.js_dsp_ms = R.separate_ms - R.infer_ms;
  R.segments = seg.length; R.seg_ms_first = seg[0]; R.seg_ms_median = seg.slice().sort((a, b) => a - b)[seg.length >> 1];
  R.realtime_x = +(R.audio_s / (R.separate_ms / 1000)).toFixed(2);
  const v = out.vocals;
  let nan = 0, peak = 0;
  for (let i = 0; i < v.left.length; i++) { const a = v.left[i]; if (a !== a) nan++; else peak = Math.max(peak, Math.abs(a)); }
  R.vocals_nan = nan; R.vocals_peak = +peak.toFixed(4);
  R.ort_warnings = warns.length; R.ort_warning_sample = warns.slice(0, 5);
  log(`separated in ${R.separate_ms} ms = ${R.realtime_x}x realtime (${R.segments} segments, median ${R.seg_ms_median} ms, first ${R.seg_ms_first} ms), NaN ${nan}, peak ${R.vocals_peak}`);

  const il = new Float32Array(v.left.length * 2);
  for (let i = 0; i < v.left.length; i++) { il[2 * i] = v.left[i]; il[2 * i + 1] = v.right[i]; }
  await fetch(`/result/${tag}.vocals.f32`, { method: "POST", body: il });
  await fetch(`/result/${tag}.json`, { method: "POST", body: JSON.stringify(R, null, 1) });
  log("SPIKE_DONE " + JSON.stringify(R));
}

main().catch(async (e) => {
  log("SPIKE_FAIL " + (e && e.stack || e));
  await fetch(`/result/${tag}.json`, { method: "POST", body: JSON.stringify({ vid, ep, power, error: String(e && e.message || e), warnings: warns.slice(0, 10) }) }).catch(() => {});
});
