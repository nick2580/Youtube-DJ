// Beat + downbeat decoding: a port of madmom's DBNDownBeatTrackingProcessor (madmom 0.17, BSD), as allin1
// calls it: beats_per_bar [3, 4], 55-215 bpm, 60 tempi, transition lambda 100, observation lambda 16,
// correct=true. Same state space, transition model and Viterbi decoding, so the same beats come out.
//
// One change for the browser: madmom keeps a backpointer for every state of every frame (~1.5 GB for a
// 4-minute song). Only the first state of each beat has more than one possible predecessor (every other
// state can only be reached from state - 1), so only those backpointers are stored (~24 MB). The decoded
// path is identical.

const roundHalfEven = (x) => { const r = Math.round(x); return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r; };

function linspace(a, b, n) {            // numpy.linspace (endpoint=True)
  const out = new Float64Array(n), step = (b - a) / (n - 1);
  for (let i = 0; i < n; i++) out[i] = a + i * step;
  if (n > 1) out[n - 1] = b;
  return out;
}

// madmom BeatStateSpace: the tempo intervals (frames per beat), log-spaced when num_intervals is given
function beatIntervals(minI, maxI, numI) {
  let iv = [];
  for (let x = roundHalfEven(minI); x <= roundHalfEven(maxI); x++) iv.push(x);
  if (numI != null && numI < iv.length) {
    let nLog = numI; iv = [];
    while (iv.length < numI) {
      const ls = linspace(Math.log2(minI), Math.log2(maxI), nLog);
      iv = [...new Set(Array.from(ls, (v) => roundHalfEven(2 ** v)))].sort((a, b) => a - b);
      nLog++;
    }
  }
  return iv;
}

// One HMM per bar length (BarStateSpace + BarTransitionModel + RNNDownBeatTrackingObservationModel)
function buildHmm(numBeats, minI, maxI, numTempi, lambda, obsLambda) {
  const iv = beatIntervals(minI, maxI, numTempi), nI = iv.length;
  const perBeat = iv.reduce((a, b) => a + b, 0), S = perBeat * numBeats;
  const pos = new Float64Array(S), sInt = new Int32Array(S), first = [], last = [];
  let s = 0;
  for (let b = 0; b < numBeats; b++) {
    const f = [], l = [];
    for (const i of iv) {
      f.push(s);
      for (let k = 0; k < i; k++, s++) { pos[s] = k * (1 / i) + b; sInt[s] = i; }
      l.push(s - 1);
    }
    first.push(f); last.push(l);
  }
  // observation pointers: 0 = no beat, 1 = beat, 2 = downbeat
  const obsPtr = new Uint8Array(S), border = 1 / obsLambda;
  for (let i = 0; i < S; i++) { if (pos[i] % 1 < border) obsPtr[i] = 1; if (pos[i] < border) obsPtr[i] = 2; }
  // transitions into each beat's first states: from the previous beat's last states (tempo may change)
  const isFirst = new Uint8Array(S), firstIdx = new Int32Array(S).fill(-1);
  const into = [];                       // into[j] = [[prevState, logProb], ...] sorted by prevState (CSR order)
  for (let b = 0; b < numBeats; b++) {
    const to = first[b], from = last[(b - 1 + numBeats) % numBeats];
    const cols = Array.from({ length: nI }, () => []);
    for (let r = 0; r < nI; r++) {
      const row = new Float64Array(nI); let sum = 0;
      for (let c = 0; c < nI; c++) {
        let p = Math.exp(-lambda * Math.abs(sInt[to[c]] / sInt[from[r]] - 1));
        if (p <= Number.EPSILON) p = 0;
        row[c] = p; sum += p;
      }
      for (let c = 0; c < nI; c++) if (row[c] !== 0) cols[c].push([from[r], Math.log(row[c] / sum)]);
    }
    for (let c = 0; c < nI; c++) {
      const st = to[c]; isFirst[st] = 1; firstIdx[st] = into.length;
      into.push(cols[c].sort((x, y) => x[0] - y[0]));
    }
  }
  const nF = into.length, fState = new Int32Array(nF), ptr = new Int32Array(nF + 1);
  let tot = 0;
  for (let j = 0; j < nF; j++) { ptr[j] = tot; tot += into[j].length; }
  ptr[nF] = tot;
  const prev = new Int32Array(tot), lp = new Float64Array(tot);
  for (let j = 0, k = 0; j < nF; j++) for (const [p, l] of into[j]) { prev[k] = p; lp[k++] = l; }
  for (let s2 = 0; s2 < S; s2++) if (isFirst[s2]) fState[firstIdx[s2]] = s2;
  return { S, pos, obsPtr, isFirst, firstIdx, fState, ptr, prev, lp, nF, obsLambda };
}

// madmom HiddenMarkovModel.viterbi with a uniform initial distribution
function viterbi(H, act) {             // act: Float32Array, T x 2 interleaved (beat, downbeat)
  const T = act.length / 2, { S, obsPtr, isFirst, firstIdx, ptr, prev, lp, nF, obsLambda } = H;
  const f = Math.fround;
  const dens = new Float64Array(T * 3);   // log densities, computed in float32 like numpy on float32 input
  for (let t = 0; t < T; t++) {
    const b = act[2 * t], d = act[2 * t + 1];
    dens[3 * t] = f(Math.log(f(f(1 - f(b + d)) / (obsLambda - 1))));
    dens[3 * t + 1] = f(Math.log(b)); dens[3 * t + 2] = f(Math.log(d));
  }
  let pv = new Float64Array(S).fill(Math.log(1 / S)), cv = new Float64Array(S);
  const bt = new Int32Array(T * nF);
  for (let t = 0; t < T; t++) {
    const o = 3 * t;
    for (let s = 0; s < S; s++) {
      const den = dens[o + obsPtr[s]];
      if (!isFirst[s]) { cv[s] = pv[s - 1] + 0 + den; continue; }   // only predecessor: s - 1, probability 1
      const j = firstIdx[s]; let best = -Infinity, arg = 0;
      for (let k = ptr[j]; k < ptr[j + 1]; k++) {
        const v = pv[prev[k]] + lp[k] + den;
        if (v > best) { best = v; arg = prev[k]; }
      }
      cv[s] = best; bt[t * nF + j] = arg;
    }
    const tmp = pv; pv = cv; cv = tmp;
  }
  let state = 0;
  for (let s = 1; s < S; s++) if (pv[s] > pv[state]) state = s;
  const logp = pv[state];
  if (!isFinite(logp)) return { path: new Int32Array(0), logp };
  const path = new Int32Array(T);
  for (let t = T - 1; t >= 0; t--) {
    path[t] = state;
    state = isFirst[state] ? bt[t * nF + firstIdx[state]] : state - 1;
  }
  return { path, logp };
}

const HMM_CACHE = new Map();
function hmms(fps) {
  if (!HMM_CACHE.has(fps)) {
    const minI = 60 * fps / 215, maxI = 60 * fps / 55;
    HMM_CACHE.set(fps, [3, 4].map((b) => buildHmm(b, minI, maxI, 60, 100, 16)));
  }
  return HMM_CACHE.get(fps);
}

// act: Float32Array T x 2 (beat-not-downbeat, downbeat). Returns [[time_s, beatNumber], ...]
export function dbnDownbeats(act, { fps = 100, threshold = 0.22 } = {}) {
  const T0 = act.length / 2;
  // threshold_activations: keep from the first to the last frame where either activation >= threshold
  let first = 0, last = 0, lo = -1, hi = -1;
  for (let t = 0; t < T0; t++) if (act[2 * t] >= threshold || act[2 * t + 1] >= threshold) { if (lo < 0) lo = t; hi = t; }
  if (hi > 0) { first = lo; last = Math.min(T0, hi + 1); }        // numpy idx.any(): false when only frame 0 passes
  const a = act.subarray(2 * first, 2 * last);
  if (!a.some((v) => v !== 0)) return [];
  const H = hmms(fps), res = H.map((h) => viterbi(h, a));
  let bi = 0;
  for (let i = 1; i < res.length; i++) if (res[i].logp > res[bi].logp) bi = i;
  const { path } = res[bi], h = H[bi], T = path.length;
  if (!T) return [];
  // correct=True: in each run of frames whose state is in the beat range, take the strongest activation
  const inRange = (t) => h.obsPtr[path[t]] >= 1;
  const idx = [];
  if (inRange(0)) idx.push(0);
  for (let t = 1; t < T; t++) if (inRange(t) !== inRange(t - 1)) idx.push(t);
  if (inRange(T - 1)) idx.push(T);
  if (!idx.some((v) => v !== 0)) return [];
  const out = [];
  for (let r = 0; r + 1 < idx.length; r += 2) {
    const L = idx[r], R = idx[r + 1];
    let m = 2 * L;                     // argmax over the flattened (frame, 2) slice: first maximum wins
    for (let k = 2 * L + 1; k < 2 * R; k++) if (a[k] > a[m]) m = k;
    const peak = ((m - 2 * L) >> 1) + L;
    out.push([(peak + first) / fps, Math.trunc(h.pos[path[peak]]) + 1]);
  }
  return out;
}
