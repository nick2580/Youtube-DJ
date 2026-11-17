// allin1 post-processing (mir-aidj/all-in-one, MIT): turns the network's logits into beats, downbeats,
// BPM and labelled sections, the same way allin1.analyze does (postprocessing/metrical.py,
// functional.py, tempo.py). Logits come from the ONNX export of harmonix-fold0.
import { dbnDownbeats } from "./dbn.js";

export const LABELS = ["start", "end", "intro", "outro", "break", "bridge", "inst", "solo", "verse", "chorus"];
const CFG = { fps: 100, hop: 441, sr: 44100, minHopsPerBeat: 24, thrDownbeat: 0.22 };
const f = Math.fround;
const sigmoid = (x) => f(1 / (1 + Math.exp(-x)));

// beat: Float32Array(T), downbeat: Float32Array(T) (logits)
export function metrical(beat, downbeat) {
  const T = beat.length, act = new Float32Array(2 * T);
  for (let t = 0; t < T; t++) {
    const pb = sigmoid(beat[t]), pd = sigmoid(downbeat[t]);
    const no = f(f(f(1 - pb) + f(1 - pd)) / 2), x = Math.max(f(1e-8), f(pb - pd));
    const sum = f(f(x + pd) + no);
    act[2 * t] = f(x / sum); act[2 * t + 1] = f(pd / sum);
  }
  const r = dbnDownbeats(act, { fps: CFG.fps, threshold: CFG.thrDownbeat });
  return { beats: r.map((x) => x[0]), downbeats: r.filter((x) => x[1] === 1).map((x) => x[0]), beat_positions: r.map((x) => x[1]) };
}

export function bpmFromBeats(beats) {           // allin1 estimate_tempo_from_beats: most common rounded bpm
  if (beats.length < 2) return null;
  const n = new Map();
  for (let i = 1; i < beats.length; i++) { const b = Math.round(60 / (beats[i] - beats[i - 1])); n.set(b, (n.get(b) || 0) + 1); }
  let best = null, bc = -1;                     // numpy argsort(...)[::-1]: on a tie the higher bpm wins
  for (const [b, c] of n) if (c > bc || (c === bc && b > best)) { best = b; bc = c; }
  return best;
}

// section: Float32Array(T) logits, fn: Float32Array(10 * T) logits, label-major (10, T)
export function functional(section, fn) {
  const T = section.length, nL = LABELS.length;
  const ps = new Float32Array(T);
  for (let t = 0; t < T; t++) ps[t] = sigmoid(section[t]);
  // local_maxima, filter 4 * 24 + 1 = 97: keep a value only where it is its window's maximum
  const w = 2 * CFG.minHopsPerBeat, lm = new Float32Array(T);
  for (let t = 0; t < T; t++) {
    let mx = -Infinity;
    for (let k = Math.max(0, t - w); k <= Math.min(T - 1, t + w); k++) if (ps[k] > mx) mx = ps[k];
    if (ps[t] === mx) lm[t] = ps[t];
  }
  // peak_picking, 12 s past and future: boundaries are window maxima that stand above the local mean
  const P = 12 * CFG.fps, F = 12 * CFG.fps, pre = new Float64Array(T + 1);
  for (let t = 0; t < T; t++) pre[t + 1] = pre[t] + lm[t];
  const sumR = (a, b) => pre[Math.max(0, Math.min(T, b))] - pre[Math.max(0, Math.min(T, a))];
  // window max over [t - P, t + F] via a monotonic deque
  const wmax = new Float32Array(T), dq = new Int32Array(T); let h = 0, tl = 0, nx = 0;
  for (let t = 0; t < T; t++) {
    for (; nx <= Math.min(T - 1, t + F); nx++) { while (tl > h && lm[dq[tl - 1]] <= lm[nx]) tl--; dq[tl++] = nx; }
    while (dq[h] < t - P) h++;
    wmax[t] = Math.max(lm[dq[h]], t - P < 0 || t + F > T - 1 ? 0 : -Infinity);   // zero padding counts at the ends
  }
  const boundary = new Uint8Array(T);
  for (let t = 0; t < T; t++) {
    if (!(lm[t] > 0 && lm[t] === wmax[t])) continue;
    const past = f(sumR(t - P, t) / P), fut = f(sumR(t + 1, t + 1 + F) / F);
    if (f(lm[t] - f(f(past + fut) / 2)) > 0) boundary[t] = 1;
  }
  const dur = (T * CFG.hop) / CFG.sr;
  let times = [];
  for (let t = 0; t < T; t++) if (boundary[t]) times.push((t * CFG.hop) / CFG.sr);
  if (!times.length || times[0] !== 0) times = [0, ...times];
  if (times[times.length - 1] !== dur) times.push(dur);
  // label of each segment: argmax of the mean softmax over its frames
  const cut = []; for (let t = 1; t < T; t++) if (boundary[t]) cut.push(t);
  const edges = [0, ...cut, T], prob = new Float32Array(nL), segs = [];
  for (let i = 0; i + 1 < edges.length && i + 1 < times.length; i++) {
    const a = edges[i], b = edges[i + 1];
    let lab = 0;
    if (b > a) {
      prob.fill(0);
      for (let t = a; t < b; t++) {
        let mx = -Infinity; for (let l = 0; l < nL; l++) mx = Math.max(mx, fn[l * T + t]);
        let z = 0; const e = new Float64Array(nL);
        for (let l = 0; l < nL; l++) { e[l] = Math.exp(fn[l * T + t] - mx); z += e[l]; }
        for (let l = 0; l < nL; l++) prob[l] += f(e[l] / z);
      }
      for (let l = 1; l < nL; l++) if (prob[l] > prob[lab]) lab = l;
    }
    segs.push({ start: times[i], end: times[i + 1], label: LABELS[lab] });
  }
  return segs;
}

// logits: {beat, downbeat, section, function} as from the ONNX model (batch dimension dropped)
export function postprocess(logits) {
  const m = metrical(logits.beat, logits.downbeat);
  return { bpm: bpmFromBeats(m.beats), ...m, segments: functional(logits.section, logits.function) };
}
