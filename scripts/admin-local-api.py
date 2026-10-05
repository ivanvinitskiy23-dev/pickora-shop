#!/usr/bin/env python3
"""Local Pickora Studio API (lab). Same routes as future CF Worker."""
from __future__ import annotations

import hashlib
import hmac
import json
import secrets
import subprocess
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "admin-render"))

from articles_catalog import list_articles  # noqa: E402
from media_upload import save_webp_upload  # noqa: E402

SECRETS = ROOT / "admin-lab" / "secrets" / "owner.local.env"
HOST = "127.0.0.1"
PORT = 8787

SESSIONS: dict[str, dict] = {}
SESSION_TTL = 60 * 60 * 12


def load_owner() -> tuple[str, str]:
    if not SECRETS.exists():
        raise SystemExit(f"Missing {SECRETS}")
    text = SECRETS.read_text(encoding="utf-8-sig")
    data = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        data[k.strip()] = v.strip()
    if "OWNER_LOGIN" not in data or "OWNER_PASSWORD" not in data:
        raise SystemExit(f"OWNER_LOGIN/OWNER_PASSWORD missing in {SECRETS}")
    return data["OWNER_LOGIN"], data["OWNER_PASSWORD"]


OWNER_LOGIN, OWNER_PASSWORD = load_owner()


def json_bytes(obj: dict, code: int = 200) -> tuple[int, bytes]:
    return code, json.dumps(obj, ensure_ascii=False).encode("utf-8")


def check_password(login: str, password: str) -> bool:
    if login != OWNER_LOGIN:
        return False
    return hmac.compare_digest(password, OWNER_PASSWORD)


class Handler(BaseHTTPRequestHandler):
    server_version = "PickoraLocalAPI/0.2"

    def log_message(self, fmt: str, *args) -> None:
        print(f"[api] {self.address_string()} {fmt % args}")

    def _cors(self) -> None:
        origin = self.headers.get("Origin", "")
        allowed = {
            "http://127.0.0.1:8765",
            "http://localhost:8765",
            "https://pickora.shop",
        }
        if origin in allowed:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization",
        )
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _send(self, code: int, body: bytes, content_type: str = "application/json") -> None:
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", content_type + "; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._cors()
        self.end_headers()

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            return json.loads(raw.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            return {}

    def _bearer(self) -> str | None:
        auth = self.headers.get("Authorization") or ""
        if auth.lower().startswith("bearer "):
            return auth[7:].strip()
        return None

    def _user_from_token(self) -> dict | None:
        token = self._bearer()
        if not token or token not in SESSIONS:
            return None
        sess = SESSIONS[token]
        if sess["exp"] < time.time():
            del SESSIONS[token]
            return None
        return sess

    def _require_user(self) -> dict | None:
        user = self._user_from_token()
        if not user:
            self._send(*json_bytes({"error": "unauthorized"}, 401))
            return None
        return user

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/health":
            return self._send(*json_bytes({"ok": True, "mode": "local"}))

        if path == "/api/me":
            user = self._require_user()
            if not user:
                return
            return self._send(
                *json_bytes(
                    {
                        "user": {
                            "login": user["login"],
                            "role": user["role"],
                            "owner": user["owner"],
                        }
                    }
                )
            )

        if path == "/api/content/home":
            if not self._require_user():
                return
            data = json.loads((ROOT / "content" / "home.json").read_text(encoding="utf-8"))
            return self._send(*json_bytes(data))

        if path == "/api/content/pins":
            if not self._require_user():
                return
            data = json.loads((ROOT / "content" / "pins.json").read_text(encoding="utf-8"))
            return self._send(*json_bytes(data))

        if path == "/api/content/products":
            if not self._require_user():
                return
            data = json.loads((ROOT / "content" / "products.json").read_text(encoding="utf-8"))
            return self._send(*json_bytes(data))

        if path == "/api/articles":
            if not self._require_user():
                return
            return self._send(*json_bytes({"articles": list_articles()}))

        if path == "/api/content/articles":
            if not self._require_user():
                return
            art_dir = ROOT / "content" / "articles"
            art_dir.mkdir(parents=True, exist_ok=True)
            drafts = []
            for p in sorted(art_dir.glob("*.json")):
                if p.name.startswith("_"):
                    continue
                try:
                    data = json.loads(p.read_text(encoding="utf-8"))
                except Exception:
                    continue
                drafts.append(
                    {
                        "slug": data.get("slug") or p.stem,
                        "title": data.get("title") or "",
                        "status": data.get("status") or "draft",
                        "updatedAt": data.get("updatedAt"),
                    }
                )
            return self._send(*json_bytes({"drafts": drafts}))

        if path.startswith("/api/content/articles/"):
            if not self._require_user():
                return
            slug = path.rsplit("/", 1)[-1]
            fp = ROOT / "content" / "articles" / f"{slug}.json"
            if not fp.exists():
                return self._send(*json_bytes({"error": "not_found"}, 404))
            return self._send(
                *json_bytes(json.loads(fp.read_text(encoding="utf-8")))
            )

        self._send(*json_bytes({"error": "not_found"}, 404))

    def do_POST(self) -> None:
        path = urlparse(self.path).path

        if path == "/api/login":
            payload = self._read_json()
            login = (payload.get("login") or "").strip()
            password = payload.get("password") or ""
            if not check_password(login, password):
                return self._send(*json_bytes({"error": "invalid_credentials"}, 401))
            token = secrets.token_urlsafe(32)
            SESSIONS[token] = {
                "login": OWNER_LOGIN,
                "role": "admin",
                "owner": True,
                "exp": time.time() + SESSION_TTL,
            }
            return self._send(
                *json_bytes(
                    {
                        "token": token,
                        "user": {
                            "login": OWNER_LOGIN,
                            "role": "admin",
                            "owner": True,
                        },
                    }
                )
            )

        if path == "/api/logout":
            token = self._bearer()
            if token and token in SESSIONS:
                del SESSIONS[token]
            return self._send(*json_bytes({"ok": True}))

        if path == "/api/media/upload":
            if not self._require_user():
                return
            payload = self._read_json()
            filename = payload.get("filename") or "upload.jpg"
            data_b64 = payload.get("data") or ""
            preferred = payload.get("preferredName")
            if not data_b64:
                return self._send(*json_bytes({"error": "missing_data"}, 400))
            try:
                result = save_webp_upload(
                    filename, data_b64, preferred_name=preferred
                )
            except Exception as ex:  # noqa: BLE001
                return self._send(
                    *json_bytes({"error": "upload_failed", "detail": str(ex)}, 400)
                )
            return self._send(*json_bytes({"ok": True, **result}))

        if path == "/api/content/home":
            if not self._require_user():
                return
            payload = self._read_json()
            reviews = payload.get("latestReviews")
            if not isinstance(reviews, list) or len(reviews) < 3 or len(reviews) > 6:
                return self._send(
                    *json_bytes(
                        {
                            "error": "latestReviews_invalid_count",
                            "hint": "Need 3..6 latest review cards",
                        },
                        400,
                    )
                )
            path_home = ROOT / "content" / "home.json"
            current = json.loads(path_home.read_text(encoding="utf-8"))
            current["latestReviews"] = reviews
            if "topPicks" in payload:
                current["topPicks"] = payload["topPicks"]
            path_home.write_text(
                json.dumps(current, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            return self._send(*json_bytes(self._run_render("render_home.py")))

        if path == "/api/content/pins":
            if not self._require_user():
                return
            payload = self._read_json()
            pins = payload.get("pins")
            filters = payload.get("filters")
            if not isinstance(pins, list) or not pins:
                return self._send(*json_bytes({"error": "pins_required"}, 400))
            path_pins = ROOT / "content" / "pins.json"
            current = json.loads(path_pins.read_text(encoding="utf-8"))
            if isinstance(filters, list) and filters:
                current["filters"] = filters
            current["pins"] = pins
            path_pins.write_text(
                json.dumps(current, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            return self._send(*json_bytes(self._run_render("render_pins.py")))

        if path == "/api/content/products":
            if not self._require_user():
                return
            payload = self._read_json()
            hubs = payload.get("hubCategories")
            if not isinstance(hubs, list) or not hubs:
                return self._send(*json_bytes({"error": "hubCategories_required"}, 400))
            path_prod = ROOT / "content" / "products.json"
            current = json.loads(path_prod.read_text(encoding="utf-8"))
            current["hubCategories"] = hubs
            if "categoryProducts" in payload:
                current["categoryProducts"] = payload["categoryProducts"]
            path_prod.write_text(
                json.dumps(current, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            return self._send(*json_bytes(self._run_render("render_products.py")))

        if path == "/api/content/articles":
            if not self._require_user():
                return
            payload = self._read_json()
            slug = (payload.get("slug") or "").strip().lower()
            if not slug or any(c for c in slug if not (c.isalnum() or c == "-")):
                return self._send(*json_bytes({"error": "invalid_slug"}, 400))
            art_dir = ROOT / "content" / "articles"
            art_dir.mkdir(parents=True, exist_ok=True)
            payload["slug"] = slug
            payload["canonical"] = f"https://pickora.shop/{slug}/"
            payload["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            if not payload.get("status"):
                payload["status"] = "draft"
            (art_dir / f"{slug}.json").write_text(
                json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            return self._send(*json_bytes({"ok": True, "draft": payload, "mode": "local"}))

        self._send(*json_bytes({"error": "not_found"}, 404))

    def _run_render(self, script_name: str) -> dict:
        try:
            subprocess.check_call(
                [sys.executable, str(ROOT / "scripts" / "admin-render" / script_name)],
                cwd=str(ROOT),
            )
            return {"ok": True, "rendered": True, "renderError": None}
        except Exception as ex:  # noqa: BLE001
            return {"ok": True, "rendered": False, "renderError": str(ex)}


def main() -> None:
    fp = hashlib.sha256(OWNER_PASSWORD.encode()).hexdigest()[:10]
    print(f"Pickora local API on http://{HOST}:{PORT}")
    print(f"Owner login: {OWNER_LOGIN} (pwd sha256...{fp})")
    print("UI: http://127.0.0.1:8765/pk-studio/")
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
