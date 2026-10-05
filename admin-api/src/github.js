/**
 * Pickora Admin API — GitHub Contents API helpers
 * Uses fetch() only (Cloudflare Workers compatible).
 *
 * Required env bindings:
 *   GITHUB_TOKEN   — fine-grained PAT with repo Contents read+write
 * Optional:
 *   GITHUB_REPO    — default "ivanvinitskiy23-dev/pickora-shop"
 *   GITHUB_BRANCH  — default "main"
 */

const DEFAULT_REPO   = "ivanvinitskiy23-dev/pickora-shop";
const DEFAULT_BRANCH = "main";

/** Encode a UTF-8 string to Base64 (Workers-safe, no TextEncoder needed). */
function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/** Decode a Base64 string to UTF-8 text. */
function base64ToUtf8(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

/**
 * Fetch a file from the repo via GitHub Contents API.
 *
 * @param {object} env   - Worker env (GITHUB_TOKEN, optionally GITHUB_REPO / GITHUB_BRANCH)
 * @param {string} path  - Repo-relative path, e.g. "articles/index.html"
 * @returns {{ sha: string, content: string }} sha = blob SHA needed for updates; content = decoded text
 * @throws Error on non-200 or missing token
 */
export async function getFile(env, path) {
  const repo   = env.GITHUB_REPO   || DEFAULT_REPO;
  const branch = env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const token  = env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env binding is missing");

  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIPath(path)}?ref=${branch}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:        "application/vnd.github+json",
      "User-Agent":  "pickora-admin-api/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub getFile ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  // GitHub returns content as Base64, possibly with newlines
  const rawB64 = (data.content || "").replace(/\n/g, "");
  return {
    sha:     data.sha,
    content: base64ToUtf8(rawB64),
  };
}

/**
 * Create or update a file in the repo via GitHub Contents API.
 *
 * @param {object} env      - Worker env
 * @param {string} path     - Repo-relative path
 * @param {string} content  - UTF-8 text content to write
 * @param {string} message  - Commit message
 * @param {string} [sha]    - Blob SHA of existing file (required for updates, omit for creates)
 * @returns {{ commit: { sha: string, message: string }, content: { path: string } }}
 * @throws Error on failure
 */
/** Fetch blob SHA only (safe for binary files). */
export async function getFileSha(env, path) {
  const repo   = env.GITHUB_REPO   || DEFAULT_REPO;
  const branch = env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const token  = env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env binding is missing");

  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIPath(path)}?ref=${branch}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:        "application/vnd.github+json",
      "User-Agent":  "pickora-admin-api/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub getFileSha ${path} → ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.sha || null;
}

/**
 * Create/update a binary file (image). Pass raw base64 (no data: prefix).
 */
export async function putBinaryFile(env, path, base64Content, message, sha) {
  const repo   = env.GITHUB_REPO   || DEFAULT_REPO;
  const branch = env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const token  = env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env binding is missing");

  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIPath(path)}`;
  const body = {
    message,
    content: String(base64Content || "").replace(/\s+/g, ""),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization:  `Bearer ${token}`,
      Accept:         "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent":   "pickora-admin-api/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`GitHub putBinaryFile ${path} → ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    commit:  { sha: data.commit?.sha, message: data.commit?.message },
    content: { path: data.content?.path, sha: data.content?.sha },
  };
}

export async function putFile(env, path, content, message, sha) {
  const repo   = env.GITHUB_REPO   || DEFAULT_REPO;
  const branch = env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const token  = env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env binding is missing");

  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIPath(path)}`;

  const body = {
    message,
    content: utf8ToBase64(content),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization:  `Bearer ${token}`,
      Accept:         "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent":   "pickora-admin-api/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`GitHub putFile ${path} → ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    commit:  { sha: data.commit?.sha, message: data.commit?.message },
    content: { path: data.content?.path, sha: data.content?.sha },
  };
}

/**
 * Delete a file from the repo (Contents API). No-op if file missing (404).
 * @returns {{ ok: true, deleted: boolean, path: string }}
 */
export async function deleteFile(env, path, message) {
  const repo   = env.GITHUB_REPO   || DEFAULT_REPO;
  const branch = env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const token  = env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env binding is missing");

  const sha = await getFileSha(env, path);
  if (!sha) return { ok: true, deleted: false, path };

  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIPath(path)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization:  `Bearer ${token}`,
      Accept:         "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent":   "pickora-admin-api/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: message || `delete ${path}`,
      sha,
      branch,
    }),
  });

  if (res.status === 404) return { ok: true, deleted: false, path };
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`GitHub deleteFile ${path} → ${res.status}: ${errBody.slice(0, 200)}`);
  }
  return { ok: true, deleted: true, path };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Encode a path for use in a GitHub API URL (preserve slashes). */
function encodeURIPath(path) {
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}
