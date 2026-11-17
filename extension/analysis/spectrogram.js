// allin1's input features: madmom's log-filtered spectrogram of each Demucs stem (allin1/spectrogram.py:
// FramedSignal 2048 @ 100 fps -> STFT (Hann) -> LogarithmicFilterbank 12 bands/octave, 30-17000 Hz,
// normalised -> log10(1 + x)). 81 bands per frame. Port of madmom 0.17 (BSD), same framing and filters.

const SR = 44100, FRAME = 2048, HOP = SR / 100, NBIN = FRAME >> 1;
const f = Math.fround;

// numpy.linspace(a, b, n, endpoint=False)
const linspaceOpen = (a, b, n) => Array.from({ length: n }, (_, k) => k * ((b - a) / n) + a);

function searchsorted(arr, x, right = false) {
  let lo = 0, hi = arr.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (right ? arr[m] <= x : arr[m] < x) lo = m + 1; else hi = m; }
  return lo;
}

// LogarithmicFilterbank(bin_frequencies, 12, 30, 17000, norm_filters=True, unique_filters=True): (NBIN, bands)
function filterbank() {
  const val = 1 / (2 * NBIN * (1 / SR));
  const binF = Float64Array.from({ length: NBIN }, (_, k) => k * val);
  const bpo = 12, fmin = 30, fmax = 17000, fref = 440;
  const left = Math.floor(Math.log2(fmin / fref) * bpo), right = Math.ceil(Math.log2(fmax / fref) * bpo);
  let fr = []; for (let k = left; k < right; k++) fr.push(fref * 2 ** (k / bpo));
  fr = fr.slice(searchsorted(fr, fmin)); fr = fr.slice(0, searchsorted(fr, fmax, true));
  let bins = fr.map((x) => {
    let i = Math.min(Math.max(searchsorted(binF, x), 1), NBIN - 1);
    if (x - binF[i - 1] < binF[i] - x) i -= 1;
    return i;
  });
  bins = [...new Set(bins)].sort((a, b) => a - b);
  const bands = [];
  for (let i = 0; i + 3 <= bins.length; i++) {
    let [start, center, stop] = bins.slice(i, i + 3);
    if (stop - start < 2) { center = start; stop = start + 1; }
    const c = center - start, n = stop - start, data = new Float32Array(n);
    linspaceOpen(0, 1, c).forEach((v, k) => { data[k] = v; });
    linspaceOpen(1, 0, n - c).forEach((v, k) => { data[c + k] = v; });
    let s = 0; for (const v of data) s += v;
    s = f(s);
    for (let k = 0; k < n; k++) data[k] = f(data[k] / s);
    bands.push({ start, data });
  }
  return bands;
}

let FB = null, WIN = null, TW = null, REV = null;
function init() {
  FB = filterbank();
  // numpy.hanning(2048), scaled like madmom for int16 audio: window / 32767 (input here is int16 / 32767)
  WIN = Float64Array.from({ length: FRAME }, (_, n) => 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (FRAME - 1)));
  TW = { re: new Float64Array(FRAME / 2), im: new Float64Array(FRAME / 2) };
  for (let k = 0; k < FRAME / 2; k++) { TW.re[k] = Math.cos((-2 * Math.PI * k) / FRAME); TW.im[k] = Math.sin((-2 * Math.PI * k) / FRAME); }
  REV = new Uint32Array(FRAME);
  const bits = Math.log2(FRAME);
  for (let i = 0; i < FRAME; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); REV[i] = r; }
}

function fft(re, im) {          // in-place radix-2, length FRAME
  for (let i = 0; i < FRAME; i++) { const j = REV[i]; if (j > i) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let size = 2; size <= FRAME; size <<= 1) {
    const half = size >> 1, step = FRAME / size;
    for (let i = 0; i < FRAME; i += size) {
      for (let j = 0, t = 0; j < half; j++, t += step) {
        const a = i + j, b = a + half, wr = TW.re[t], wi = TW.im[t];
        const xr = re[b] * wr - im[b] * wi, xi = re[b] * wi + im[b] * wr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
      }
    }
  }
}

export const NUM_BANDS = 81;

// mono: Float32Array/Float64Array at 44.1 kHz, full scale +-1 (madmom sees int16 / 32767).
// Returns Float32Array(T * 81), frame-major, T = ceil(len / 441).
export function logSpectrogram(mono) {
  if (!FB) init();
  const N = mono.length, T = Math.ceil(N / HOP), nb = FB.length;
  const out = new Float32Array(T * nb), re = new Float64Array(FRAME), im = new Float64Array(FRAME), mag = new Float32Array(NBIN);
  for (let t = 0; t < T; t++) {
    const start = Math.trunc(t * HOP) - FRAME / 2;
    for (let n = 0; n < FRAME; n++) { const i = start + n; re[n] = i >= 0 && i < N ? mono[i] * WIN[n] : 0; im[n] = 0; }
    fft(re, im);
    for (let k = 0; k < NBIN; k++) mag[k] = f(Math.hypot(f(re[k]), f(im[k])));       // complex64 -> abs
    const o = t * nb;
    for (let b = 0; b < nb; b++) {
      const { start: s0, data } = FB[b]; let acc = 0;
      for (let k = 0; k < data.length && s0 + k < NBIN; k++) acc += mag[s0 + k] * data[k];
      out[o + b] = f(Math.log10(f(f(acc) + 1)));
    }
  }
  return out;
}

// allin1 input for one song: stems {bass, drums, other, vocals} as [left, right] channel pairs.
// Returns Float32Array(4 * T * 81) laid out (instrument, T, 81) in allin1's order: bass, drums, other, vocals.
export function allin1Input(stems) {
  const order = ["bass", "drums", "other", "vocals"], specs = [];
  for (const k of order) {
    const [L, R] = stems[k], mono = new Float32Array(L.length);
    for (let i = 0; i < L.length; i++) mono[i] = (L[i] + R[i]) / 2;
    specs.push(logSpectrogram(mono));
  }
  const out = new Float32Array(specs.reduce((a, s) => a + s.length, 0));
  let o = 0; for (const s of specs) { out.set(s, o); o += s.length; }
  return out;
}
