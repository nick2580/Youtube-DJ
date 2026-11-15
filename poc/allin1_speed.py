import time, warnings, sys; warnings.filterwarnings("ignore")
import allin1, torch, shutil, os
mm = lambda s: f"{int(s//60)}:{s%60:04.1f}"
p = "cache/FxAG_11PzCk.wav"
for model in ["harmonix-fold0"]:
    shutil.rmtree("struct", ignore_errors=True)
    t = time.time()
    r = allin1.analyze(p, out_dir="struct", demix_dir="allin1_demix", spec_dir="allin1_spec", device="cuda",
                       keep_byproducts=True, multiprocess=False, model=model)
    print(f"{model}: {time.time()-t:.1f}s | BPM {r.bpm} | " + " ".join(f"[{mm(s.start)} {s.label}]" for s in r.segments))
