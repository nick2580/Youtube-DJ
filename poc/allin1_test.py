import time, warnings, json
warnings.filterwarnings("ignore")
t = time.time(); import allin1, torch; print(f"import {time.time()-t:.1f}s, cuda {torch.cuda.is_available()}")
import sys
songs = dict(a.split("=") for a in sys.argv[1:]) or {"Galliyan": "cache/FxAG_11PzCk.wav"}
for name, p in songs.items():
    t = time.time()
    r = allin1.analyze(p, out_dir="struct", demix_dir="allin1_demix", spec_dir="allin1_spec", device="cuda", keep_byproducts=True, multiprocess=False)
    dt = time.time() - t
    mm = lambda s: f"{int(s//60)}:{s%60:04.1f}"
    print(f"\n{name}: {dt:.1f}s | BPM {r.bpm} | beats {len(r.beats)} | downbeats {len(r.downbeats)}")
    print("  " + "  ".join(f"[{mm(s.start)}-{mm(s.end)} {s.label}]" for s in r.segments))
