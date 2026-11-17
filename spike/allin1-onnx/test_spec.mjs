// JS spectrogram (extension/analysis/spectrogram.js) vs the helper's allin1 input (poc/struct/spec/<vid>.npy),
// from the same Demucs stems (poc/stems/htdemucs/<vid>/*.wav, int16). The int16 stems are downmixed the way
// madmom does (mean, truncated to int16) and scaled by 1/32767, so this checks the port itself.
// Also writes the JS spectrogram to out/jsspec/<vid>.f32 for check_chain.py (ONNX + post on JS input).
// usage (repo root): node spike/allin1-onnx/test_spec.mjs [n_songs=6]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { logSpectrogram, NUM_BANDS } from "../../extension/analysis/spectrogram.js";

const HERE = path.dirname(fileURLToPath(import.meta.url)), POC = path.join(HERE, "..", "..", "poc");
const OUT = path.join(HERE, "out", "jsspec"); fs.mkdirSync(OUT, { recursive: true });

function readWav16(p) {          // PCM16 WAV -> {ch: [Int16Array...]}
  const b = fs.readFileSync(p); let o = 12, fmt, data;
  while (o < b.length) { const id = b.toString("ascii", o, o + 4), n = b.readUInt32LE(o + 4); if (id === "fmt ") fmt = o + 8; if (id === "data") { data = [o + 8, n]; break; } o += 8 + n + (n & 1); }
  const nch = b.readUInt16LE(fmt + 2), bits = b.readUInt16LE(fmt + 14);
  if (bits !== 16) throw new Error("expected 16-bit wav");
  const all = new Int16Array(b.buffer.slice(b.byteOffset + data[0], b.byteOffset + data[0] + data[1]));
  const n = all.length / nch, ch = Array.from({ length: nch }, () => new Int16Array(n));
  for (let i = 0; i < n; i++) for (let c = 0; c < nch; c++) ch[c][i] = all[i * nch + c];
  return ch;
}
function readNpy(p) {            // little-endian float32 .npy, C order
  const b = fs.readFileSync(p), hl = b.readUInt16LE(8), hdr = b.toString("latin1", 10, 10 + hl);
  if (!hdr.includes("<f4")) throw new Error("expected float32 npy: " + hdr);
  const shape = hdr.match(/\(([^)]*)\)/)[1].split(",").filter((s) => s.trim()).map(Number);
  return { shape, data: new Float32Array(b.buffer.slice(b.byteOffset + 10 + hl)) };
}

const N = +(process.argv[2] || 6);
const vids = fs.readdirSync(path.join(POC, "struct", "spec")).map((f) => f.slice(0, -4)).sort().slice(0, N);
for (const v of vids) {
  const ref = readNpy(path.join(POC, "struct", "spec", v + ".npy"));
  const [K, T, F] = ref.shape;
  if (F !== NUM_BANDS) throw new Error(`bands ${F} vs ${NUM_BANDS}`);
  const parts = [], t0 = performance.now();
  for (const s of ["bass", "drums", "other", "vocals"]) {
    const [L, R] = readWav16(path.join(POC, "stems", "htdemucs", v, s + ".wav"));
    const mono = new Float64Array(L.length);
    for (let i = 0; i < L.length; i++) mono[i] = Math.trunc((L[i] + R[i]) / 2) / 32767;     // np.mean(...).astype(int16)
    parts.push(logSpectrogram(mono));
  }
  const ms = performance.now() - t0;
  const got = new Float32Array(K * T * F); parts.forEach((p, k) => got.set(p.subarray(0, T * F), k * T * F));
  let mx = 0, sum = 0;
  for (let i = 0; i < got.length; i++) { const d = Math.abs(got[i] - ref.data[i]); sum += d; if (d > mx) mx = d; }
  fs.writeFileSync(path.join(OUT, v + ".f32"), Buffer.from(got.buffer));
  console.log(`${v} T=${T} frames(js)=${parts[0].length / F}  max|diff| ${mx.toExponential(2)}  mean ${(sum / got.length).toExponential(2)}  ${ms.toFixed(0)} ms`);
}
