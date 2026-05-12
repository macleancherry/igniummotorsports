-- Add driver stats columns to Ignium drivers table
ALTER TABLE drivers ADD COLUMN last_seen_at TEXT;
ALTER TABLE drivers ADD COLUMN total_sessions INTEGER DEFAULT 0;
ALTER TABLE drivers ADD COLUMN latest_series TEXT;
ALTER TABLE drivers ADD COLUMN latest_track TEXT;
ALTER TABLE drivers ADD COLUMN latest_finish_position INTEGER;
ALTER TABLE drivers ADD COLUMN best_finish_position INTEGER;
ALTER TABLE drivers ADD COLUMN total_results INTEGER DEFAULT 0;
ALTER TABLE drivers ADD COLUMN irating INTEGER;
ALTER TABLE drivers ADD COLUMN license_class TEXT;
ALTER TABLE drivers ADD COLUMN gridrep_synced_at TEXT;
