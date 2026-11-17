// JS allin1 post-processing (extension/analysis/allin1post.js) vs the helper's allin1 results.
// Input: logits from dump_logits.py. Reference: poc/struct/<vid>.json (allin1.analyze, PyTorch + madmom).
// usage (repo root): node spike/allin1-onnx/test_post.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { postprocess } from "../../extension/analysis/allin1post.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOG = path.join(HERE, "out", "logits"), STRUCT = path.join(HERE, "..", "..", "poc", "struct");
const rd = (f) => { const b = fs.readFileSync(f); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const vids = [...new Set(fs.readdirSync(LOG).map((f) => f.split(".")[0]))].sort();
const near = (ref, est, tol = 0.011) => ref.length ? ref.filter((t) => est.some((e) => Math.abs(e - t) < tol)).length / ref.length : 1;
let n = 0, exactB = 0, exactD = 0, exactS = 0, bpmOk = 0, ms = 0;
for (const v of vids) {
  const L = Object.fromEntries(["beat", "downbeat", "section", "function"].map((k) => [k, rd(path.join(LOG, `${v}.${k}.f32`))]));
  const ref = JSON.parse(fs.readFileSync(path.join(STRUCT, `${v}.json`), "utf8"));
  const t0 = performance.now(); const got = postprocess(L); const dt = performance.now() - t0; ms += dt;
  const sameB = got.beats.length === ref.beats.length && got.beats.every((x, i) => Math.abs(x - ref.beats[i]) < 1e-6);
  const sameD = got.downbeats.length === ref.downbeats.length && got.downbeats.every((x, i) => Math.abs(x - ref.downbeats[i]) < 1e-6);
  const rs = ref.segments.map((s) => `${s.start.toFixed(2)}-${s.end.toFixed(2)} ${s.label}`).join(", ");
  const gs = got.segments.map((s) => `${s.start.toFixed(2)}-${s.end.toFixed(2)} ${s.label}`).join(", ");
  n++; exactB += sameB; exactD += sameD; exactS += rs === gs; bpmOk += got.bpm === ref.bpm;
  console.log(`${v} ${(L.beat.length / 100).toFixed(0)}s ${dt.toFixed(0)}ms  beats ${sameB ? "same" : `DIFF (${got.beats.length} vs ${ref.beats.length}, ${(near(ref.beats, got.beats) * 100).toFixed(1)}% within 10 ms)`}` +
    `  downbeats ${sameD ? "same" : `DIFF (${(near(ref.downbeats, got.downbeats) * 100).toFixed(1)}%)`}  sections ${rs === gs ? "same" : "DIFF"}  bpm ${got.bpm}/${ref.bpm}`);
  if (rs !== gs) console.log("   ref:", rs, "\n   js: ", gs);
}
console.log(`\n${n} songs: beats identical ${exactB}/${n}, downbeats ${exactD}/${n}, sections ${exactS}/${n}, bpm ${bpmOk}/${n}; mean ${(ms / n).toFixed(0)} ms per song`);
