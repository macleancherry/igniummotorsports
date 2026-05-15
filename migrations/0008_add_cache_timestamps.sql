-- Add cache timestamps to enable instant loading from D1
ALTER TABLE drivers ADD COLUMN cached_at TEXT;

ALTER TABLE news_posts ADD COLUMN cached_at TEXT;

ALTER TABLE events ADD COLUMN cached_at TEXT;

ALTER TABLE results ADD COLUMN cached_at TEXT;

-- Set initial cached_at to now for existing data
UPDATE drivers SET cached_at = datetime('now') WHERE cached_at IS NULL;
UPDATE news_posts SET cached_at = datetime('now') WHERE cached_at IS NULL;
UPDATE events SET cached_at = datetime('now') WHERE cached_at IS NULL;
UPDATE results SET cached_at = datetime('now') WHERE cached_at IS NULL;
