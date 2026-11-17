"""
Static server for the Demucs-in-the-browser timing spike (127.0.0.1 only).

  GET  /                    -> this folder (run.html, vendor/, models/)
  GET  /audio/<vid>.wav     -> poc/cache/<vid>.wav (songs the helper already downloaded)
  POST /result/<name>       -> saved as out/<name> (timing JSON, raw float32 vocals)

Sends COOP/COEP so the page is cross-origin isolated (multi-threaded WASM needs SharedArrayBuffer).
Run with any Python 3: python serve.py [port]
"""
import http.server, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "..", "poc", "cache")
OUT = os.path.join(HERE, "out")


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=HERE, **k)

    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def guess_type(self, path):
        return "text/javascript" if path.endswith((".mjs", ".js")) else super().guess_type(path)

    def do_GET(self):
        m = re.fullmatch(r"/audio/([\w-]{11})\.wav", self.path)
        if m:
            p = os.path.join(CACHE, m.group(1) + ".wav")
            if not os.path.exists(p):
                return self.send_error(404)
            data = open(p, "rb").read()
            self.send_response(200); self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(data))); self.end_headers(); self.wfile.write(data)
            return
        super().do_GET()

    def do_POST(self):
        m = re.fullmatch(r"/result/([\w.-]+)", self.path)
        if not m:
            return self.send_error(404)
        n = int(self.headers.get("Content-Length", 0))
        os.makedirs(OUT, exist_ok=True)
        with open(os.path.join(OUT, m.group(1)), "wb") as f:
            f.write(self.rfile.read(n))
        self.send_response(204); self.end_headers()

    def log_message(self, fmt, *a):
        if "POST" in (a[0] if a else ""):
            sys.stderr.write("saved " + a[0] + "\n")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8790
    print(f"http://127.0.0.1:{port}/run.html?vid=<id>&ep=webgpu&power=high-performance", flush=True)
    http.server.ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
