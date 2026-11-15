import time, sys, os, shutil
t=time.time(); import separator, fast_analysis; print(f"imports {time.time()-t:.1f}s")
t=time.time(); separator.warm(); print(f"model load {time.time()-t:.1f}s")
p="cache/aT4N7jn2Eww.wav"
d="stems_bench"; shutil.rmtree(d, ignore_errors=True)
t=time.time(); separator.separate_vocals(p, root=d); print(f"demucs warm, {os.path.getsize(p)/176400:.0f}s song: {time.time()-t:.1f}s")
t=time.time(); A=fast_analysis.analyse_fast(p); print(f"fast analysis: {time.time()-t:.1f}s  tempo {A['tempo']:.1f} key {A['key']['key']} bars {len(A['bars'])}")
shutil.rmtree(d, ignore_errors=True)
