"""
Register poc/natten_shim on this interpreter's sys.path (via a .pth file in site-packages), so allin1's
`import natten` resolves to our pure-PyTorch implementation instead of the compiled NATTEN package.
Run once with the helper's venv:  .venv/Scripts/python install_natten_shim.py   (Windows)
                                  .venv/bin/python install_natten_shim.py       (macOS / Linux)
"""
import os, sysconfig

shim = os.path.join(os.path.dirname(os.path.abspath(__file__)), "natten_shim")
pth = os.path.join(sysconfig.get_paths()["purelib"], "ytdj_natten_shim.pth")
with open(pth, "w", encoding="utf-8") as f:
    f.write(shim + "\n")
print(f"wrote {pth} -> {shim}")
