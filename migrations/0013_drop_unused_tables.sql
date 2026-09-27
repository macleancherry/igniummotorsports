-- The website no longer stores driver stats, events, or live timing in D1:
-- driver roster is a static file (src/data/roster.ts), and results are now
-- hand-maintained (src/data/results.ts) or linked from Instagram. Only
-- news_posts is still used by the site.

DELETE FROM news_posts WHERE slug = 'ignium-live-race-control-launch';

DROP TABLE IF EXISTS live_timing_snapshots;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS event_drivers;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS drivers;
