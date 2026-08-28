from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


DIST = Path(__file__).resolve().parents[1] / "dist"


class ItiniHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "credentialless")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        requested = DIST / self.path.lstrip("/").split("?", 1)[0]
        if self.path != "/" and not requested.exists() and "." not in requested.name:
            self.path = "/index.html"
        return super().do_GET()


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8083), ItiniHandler).serve_forever()
