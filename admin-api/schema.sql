-- Pickora Admin D1 schema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  is_owner INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_login TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS content_drafts (
  key TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS media_files (
  key TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  data_b64 TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  uploaded_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Publish rollback foundation: stores commit SHAs for each successful publish.
-- Global last-5 policy enforced by the API after each insert.
CREATE TABLE IF NOT EXISTS publish_snapshots (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  module     TEXT NOT NULL,               -- 'article' | 'home' | 'pins' | 'products'
  detail     TEXT,                        -- slug for article, 'home'/'pins'/'products' for others
  commit_shas TEXT NOT NULL DEFAULT '[]', -- JSON array of GitHub commit SHAs
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT
);
