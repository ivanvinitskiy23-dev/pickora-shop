/** Auth client — local API on localhost, Cloudflare Worker on pickora.shop */
window.PK_AUTH = (function () {
  const SESSION_KEY = "pk_studio_session";

  function detectApi() {
    if (typeof window.PK_API_BASE === "string" && window.PK_API_BASE) {
      return window.PK_API_BASE.replace(/\/$/, "");
    }
    const host = location.hostname;
    if (host === "pickora.shop" || host === "www.pickora.shop") {
      return "https://pickora-admin-api.pickara-admin.workers.dev";
    }
    return "http://127.0.0.1:8787";
  }

  const API = detectApi();

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }

  function setSession(data) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  async function login(login, password) {
    const res = await fetch(API + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ login, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || "auth_failed");
      err.status = res.status;
      throw err;
    }
    setSession({
      token: data.token,
      login: data.user.login,
      role: data.user.role,
      owner: !!data.user.owner,
    });
    return data;
  }

  async function logout() {
    const s = getSession();
    try {
      await fetch(API + "/api/logout", {
        method: "POST",
        headers: s?.token ? { Authorization: "Bearer " + s.token } : {},
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    clearSession();
  }

  async function me() {
    const s = getSession();
    if (!s?.token) return null;
    try {
      const res = await fetch(API + "/api/me", {
        headers: { Authorization: "Bearer " + s.token },
        credentials: "include",
      });
      if (!res.ok) {
        clearSession();
        return null;
      }
      return await res.json();
    } catch {
      // Network offline — do not fake a logged-in user from stale session
      return null;
    }
  }

  /**
   * Authenticated fetch — on 401 clears session and reloads to login.
   * Pass relative path ("/api/…") or absolute URL.
   */
  async function apiFetch(path, opts = {}) {
    const s = getSession();
    const url = path.startsWith("http") ? path : API + path;
    const headers = { ...(opts.headers || {}) };
    if (s?.token && !headers.Authorization) {
      headers.Authorization = "Bearer " + s.token;
    }
    const res = await fetch(url, {
      ...opts,
      headers,
      credentials: opts.credentials || "include",
    });
    if (res.status === 401) {
      clearSession();
      if (typeof window.PK_STUDIO_ON_UNAUTHORIZED === "function") {
        window.PK_STUDIO_ON_UNAUTHORIZED();
      } else {
        location.reload();
      }
    }
    return res;
  }

  function isCloud() {
    return /workers\.dev$/.test(API) || API.includes("pickara-admin");
  }

  return { API, getSession, login, logout, me, clearSession, isCloud, apiFetch };
})();