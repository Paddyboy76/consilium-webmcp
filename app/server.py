import json
import mimetypes
import os
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from .core import (commit_action, consult_council, current_context, inspect_trace,
                   propose_action, reset_demo, search_memory)
from .demo_data import ADVISORS, SOURCES

PUBLIC = Path(__file__).resolve().parents[1] / "web"


class Handler(BaseHTTPRequestHandler):
    server_version = "Consilium/1"

    def _json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        self.wfile.write(body)

    def _session(self):
        raw = self.headers.get("X-Consilium-Session", "demo")
        return raw if raw.isalnum() and len(raw) <= 32 else "demo"

    def _body(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length > 8192:
            raise ValueError("request too large")
        return json.loads(self.rfile.read(length) or b"{}")

    def do_GET(self):
        parsed = urlparse(self.path)
        try:
            if parsed.path == "/api/health":
                return self._json(200, {"status": "ok", "service": "consilium-webmcp", "openai_configured": bool(os.getenv("OPENAI_API_KEY"))})
            if parsed.path == "/api/context":
                return self._json(200, current_context(self._session()))
            if parsed.path == "/api/memory":
                query = parse_qs(parsed.query).get("q", [""])[0][:300]
                return self._json(200, {"results": search_memory(query, 5), "content_trust": "untrusted_data"})
            if parsed.path == "/api/advisors":
                return self._json(200, {"advisors": ADVISORS, "sources": SOURCES})
            if parsed.path.startswith("/api/traces/"):
                return self._json(200, inspect_trace(parsed.path.rsplit("/", 1)[1], self._session()))
            path = PUBLIC / ("index.html" if parsed.path == "/" else parsed.path.lstrip("/"))
            if PUBLIC not in path.resolve().parents or not path.is_file():
                return self._json(404, {"error": "not found"})
            body = path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", mimetypes.guess_type(path)[0] or "application/octet-stream")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'")
            self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
            self.end_headers()
            self.wfile.write(body)
        except (ValueError, LookupError) as exc:
            self._json(400 if isinstance(exc, ValueError) else 404, {"error": str(exc)})
        except Exception:
            self._json(500, {"error": "internal error"})

    def do_POST(self):
        try:
            body = self._body()
            if self.path == "/api/reset":
                result = reset_demo(self._session())
            elif self.path == "/api/council":
                result = consult_council(body.get("question"), self._session())
            elif self.path == "/api/proposals":
                result = propose_action(body.get("text"), body.get("rationale", ""), self._session())
            elif self.path == "/api/actions/commit":
                result = commit_action(body.get("proposal_id"), self._session())
            else:
                return self._json(404, {"error": "not found"})
            self._json(200, result)
        except (ValueError, LookupError) as exc:
            self._json(400 if isinstance(exc, ValueError) else 404, {"error": str(exc)})
        except Exception:
            self._json(500, {"error": "internal error"})

    def log_message(self, fmt, *args):
        print(f"{self.address_string()} {fmt % args}")


def main():
    reset_demo("demo")
    host, port = "127.0.0.1", int(os.getenv("CONSILIUM_PORT", "8765"))
    print(f"Consilium listening on http://{host}:{port}")
    ThreadingHTTPServer((host, port), Handler).serve_forever()


if __name__ == "__main__":
    main()

