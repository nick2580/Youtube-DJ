# Spike: Demucs in the browser (WebGPU)

Question: can the in-browser build (plan C: analysis, render and Demucs in the extension, a tiny helper only
fetches audio) separate vocals fast enough, and close enough to the Python helper, to drop torch?

**Answer: yes, on a discrete GPU.** A full song separates at ~5x realtime, and the vocals drive the mix logic
the same way as the Python helper's.

## Results (RTX 3060 Laptop, Chrome 157 headless, onnxruntime-web 1.31.1)

Whole songs. "Agree" = `dj_mix_v5.vocal_activity` (what the engine scores transitions with) on browser
vocals vs `poc/stems/htdemucs/<vid>/vocals.wav`, per 20 ms frame.

| Setup | Song | Total | Network | JS DSP | x realtime | SDR vs Python | Agree | Edge err p95 |
|---|---|---|---|---|---|---|---|---|
| fp32 single file, all stems | 4:19 | 110 s | 45 s | 65 s | 2.4 | 22.2 dB | 99.6% | 60 ms |
| fp16 split, all stems | 4:19 | 88 s | 23 s | 65 s | 3.0 | 22.1 dB | 99.6% | 60 ms |
| **fp16 split, vocals only** | 4:19 | **51 s** | 23 s | 29 s | **5.1** | 22.1 dB | 99.6% | 60 ms |
| fp16 split, vocals only | 2:24 | 31 s | 14 s | 17 s | 4.7 | 24.3 dB | 99.9% | 20 ms |
| fp16 split, vocals only | 3:13 | 40 s | 18 s | 22 s | 4.8 | 28.0 dB | 99.7% | 75 ms |
| WASM (CPU, 8 threads), 60 s clip | 1:00 | 70 s | 61 s | 10 s | 0.85 | | | |

- No NaNs with either model. The split model's CPU-pinned normalisation nodes are needed (see `chain.js`).
- onnxruntime-web 1.22 + fp16 split gave NaN vocals (65k samples); 1.31 is fine. Pin >= 1.31.
- "Vocals only" = `vocals_only.js`: demucs-web's processor, but mask/iSTFT/overlap-add only for the vocals
  stem, which is all the engine reads (`dj_mix_v3.stems`). Same output, 1.7x faster.
- Couldn't test the Intel UHD iGPU: Chrome only exposes the NVIDIA adapter on this laptop.

## What it means for the port

- Budget: a song is in the set ~90-170 s; separating the *next* song takes ~30-50 s. Comfortable on a dGPU.
- CPU-only machines (0.85x realtime) can't do whole songs in time. Options: separate only the windows the
  planner needs, or fall back to a non-Demucs vocal estimate. Decide when the planner is ported.
- Remaining JS DSP (~55% of the time) runs on the main thread here; in the extension it moves to a worker
  in the offscreen document, and the FFT can go to WASM if needed.
- Model is 121 MB (21 fp16 pieces, MIT, `monteslu/htdemucs-web-onnx` on Hugging Face). Download once and
  cache it (Cache Storage), not bundled in the extension zip.

## Running it

```bash
bash spike/demucs-webgpu/fetch.sh     # vendors ORT + demucs-web, downloads the models
python spike/demucs-webgpu/serve.py   # 127.0.0.1:8790, serves poc/cache/<vid>.wav to the page
VOX=1 MODEL=models/split bash spike/demucs-webgpu/bench.sh <vid> webgpu
poc/.venv/Scripts/python spike/demucs-webgpu/compare.py out/<vid>.webgpu.high-performance.split.vox.vocals.f32
```

`bench.sh` env: `MODEL=models/split` (fp16 chain; default is the fp32 single file), `VOX=1` (vocals only),
`ORT=ort-1.22` (another vendored ORT), `CHROME_FLAGS=...`. `vendor/`, `models/` and `out/` are gitignored
(third-party code, 300 MB of weights, and separated copyrighted audio); `fetch.sh` recreates the first two.
