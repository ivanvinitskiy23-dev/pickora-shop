-- Apply on existing remote D1:
--   npx wrangler d1 execute pickora-admin --remote --file=migrations/001_login_attempts.sql
CREATE TABLE IF NOT EXISTS login_attempts (
  bucket TEXT PRIMARY KEY,
  fail_count INTEGER NOT NULL DEFAULT 0,
  window_started_at TEXT NOT NULL DEFAULT (datetime('now')),
  locked_until TEXT
);
