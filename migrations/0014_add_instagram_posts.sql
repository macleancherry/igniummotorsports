-- Instagram content sync: stores posts pulled in by the local scraper
-- (scripts/instagram-sync.mjs) via the authenticated functions/api/social.ts
-- POST endpoint, replacing the hand-edited src/data/social-posts.ts array.
--
-- No official Instagram API is involved (the team doesn't own/administer the
-- account, so no Graph API access token is available) — image_url is
-- whatever URL the scraper found on the post page at sync time. Instagram's
-- CDN URLs can rotate, so this table is expected to be re-synced
-- periodically rather than treated as a one-time import.

CREATE TABLE instagram_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ig_post_id TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  permalink TEXT,
  posted_at TEXT,
  synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_instagram_posts_posted_at ON instagram_posts (posted_at DESC);
