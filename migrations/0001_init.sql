CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  handle TEXT,
  iracing_customer_id INTEGER,
  race_number TEXT,
  country TEXT,
  bio TEXT,
  avatar_url TEXT,
  twitch_url TEXT,
  youtube_url TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS news_posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body_markdown TEXT,
  cover_image_url TEXT,
  author TEXT,
  published_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  team_name TEXT,
  series TEXT,
  track TEXT,
  car_class TEXT,
  car TEXT,
  start_time TEXT,
  status TEXT DEFAULT 'scheduled',
  iracing_session_id TEXT,
  subsession_id TEXT,
  timing_url TEXT,
  stream_url TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS event_drivers (
  event_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  role TEXT DEFAULT 'driver',
  stint_order INTEGER,
  PRIMARY KEY (event_id, driver_id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY,
  driver_id INTEGER,
  event_id INTEGER,
  source TEXT DEFAULT 'manual',
  source_result_id TEXT,
  iracing_customer_id INTEGER,
  subsession_id TEXT,
  driver_name TEXT,
  team_name TEXT,
  series TEXT,
  track TEXT,
  car TEXT,
  car_class TEXT,
  qualifying_position INTEGER,
  start_position INTEGER,
  finish_position INTEGER,
  class_position INTEGER,
  field_size INTEGER,
  class_field_size INTEGER,
  laps_completed INTEGER,
  best_lap TEXT,
  incidents INTEGER,
  strength_of_field INTEGER,
  irating_change INTEGER,
  license_change TEXT,
  official INTEGER DEFAULT 1,
  result_url TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS live_timing_snapshots (
  id INTEGER PRIMARY KEY,
  event_id INTEGER NOT NULL,
  car_number TEXT,
  driver_name TEXT NOT NULL,
  position INTEGER,
  class_position INTEGER,
  lap INTEGER,
  last_lap TEXT,
  best_lap TEXT,
  gap TEXT,
  interval TEXT,
  pit_status TEXT,
  stream_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE INDEX IF NOT EXISTS idx_drivers_slug ON drivers(slug);
CREATE INDEX IF NOT EXISTS idx_drivers_iracing ON drivers(iracing_customer_id);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_results_driver ON results(driver_id);
CREATE INDEX IF NOT EXISTS idx_results_completed ON results(completed_at);
CREATE INDEX IF NOT EXISTS idx_results_subsession_customer ON results(subsession_id, iracing_customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_results_source_source_result_id ON results(source, source_result_id) WHERE source_result_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_results_subsession_customer ON results(subsession_id, iracing_customer_id) WHERE subsession_id IS NOT NULL AND iracing_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_live_timing_event_created ON live_timing_snapshots(event_id, created_at DESC);
