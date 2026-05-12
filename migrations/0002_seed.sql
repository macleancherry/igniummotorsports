INSERT INTO drivers (name, slug, handle, iracing_customer_id, race_number, country, bio, avatar_url, twitch_url, youtube_url, active, updated_at)
SELECT 'Mac Cherry', 'mac-cherry', 'BudgetDadRacing', 123456, '23', 'Australia', 'Endurance-focused GT driver with a calm, data-first racecraft approach.', 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80', NULL, 'https://www.youtube.com/@BudgetDadRacing', 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE slug = 'mac-cherry');

INSERT INTO drivers (name, slug, handle, iracing_customer_id, race_number, country, bio, avatar_url, twitch_url, youtube_url, active, updated_at)
SELECT 'Jaco Boshoff', 'jaco-boshoff', 'JacoB', 234567, '48', 'South Africa', 'Consistent race stints and low-incident execution in multi-class traffic.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'https://www.twitch.tv/example_jaco', NULL, 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE slug = 'jaco-boshoff');

INSERT INTO drivers (name, slug, handle, iracing_customer_id, race_number, country, bio, avatar_url, twitch_url, youtube_url, active, updated_at)
SELECT 'Ryan Hirons', 'ryan-hirons', 'RHIRONS', 345678, '77', 'United Kingdom', 'Adaptive setup feedback and clean finishing pace under pressure.', 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=400&q=80', NULL, 'https://www.youtube.com/@ryanhironsracing', 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE slug = 'ryan-hirons');

INSERT INTO events (title, slug, team_name, series, track, car_class, car, start_time, status, timing_url, stream_url, notes, updated_at)
SELECT 'IMSA Endurance - Long Beach', 'imsa-endurance-long-beach-demo', 'Ignium Motorsport', 'IMSA Endurance', 'Long Beach', 'GT3', 'Ferrari 296 GT3', datetime('now', '+20 minutes'), 'live', 'https://timing.example.com/ignium-long-beach', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Demo live race control event with rolling timing data.', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM events WHERE slug = 'imsa-endurance-long-beach-demo');

INSERT INTO event_drivers (event_id, driver_id, role, stint_order)
SELECT e.id, d.id, 'driver', 1
FROM events e
JOIN drivers d ON d.slug = 'mac-cherry'
WHERE e.slug = 'imsa-endurance-long-beach-demo'
  AND NOT EXISTS (
    SELECT 1 FROM event_drivers ed WHERE ed.event_id = e.id AND ed.driver_id = d.id
  );

INSERT INTO event_drivers (event_id, driver_id, role, stint_order)
SELECT e.id, d.id, 'driver', 2
FROM events e
JOIN drivers d ON d.slug = 'jaco-boshoff'
WHERE e.slug = 'imsa-endurance-long-beach-demo'
  AND NOT EXISTS (
    SELECT 1 FROM event_drivers ed WHERE ed.event_id = e.id AND ed.driver_id = d.id
  );

INSERT INTO event_drivers (event_id, driver_id, role, stint_order)
SELECT e.id, d.id, 'driver', 3
FROM events e
JOIN drivers d ON d.slug = 'ryan-hirons'
WHERE e.slug = 'imsa-endurance-long-beach-demo'
  AND NOT EXISTS (
    SELECT 1 FROM event_drivers ed WHERE ed.event_id = e.id AND ed.driver_id = d.id
  );

INSERT INTO results (
  driver_id,
  source,
  source_result_id,
  iracing_customer_id,
  subsession_id,
  driver_name,
  team_name,
  series,
  track,
  car,
  car_class,
  qualifying_position,
  start_position,
  finish_position,
  class_position,
  field_size,
  class_field_size,
  laps_completed,
  best_lap,
  incidents,
  strength_of_field,
  irating_change,
  license_change,
  official,
  result_url,
  completed_at,
  updated_at
)
SELECT
  d.id,
  'manual',
  'demo:long-beach:mac',
  d.iracing_customer_id,
  '78901234',
  d.name,
  'Ignium Motorsport',
  'IMSA Endurance',
  'Long Beach',
  'Ferrari 296 GT3',
  'GT3',
  11,
  11,
  7,
  5,
  34,
  18,
  52,
  '1:19.083',
  4,
  2850,
  42,
  '+0.05',
  1,
  'https://members.iracing.com/membersite/member/EventResult.do?subsessionid=78901234',
  '2026-03-28T00:00:00Z',
  CURRENT_TIMESTAMP
FROM drivers d
WHERE d.slug = 'mac-cherry'
  AND NOT EXISTS (
    SELECT 1 FROM results r WHERE r.source = 'manual' AND r.source_result_id = 'demo:long-beach:mac'
  );

INSERT INTO news_posts (title, slug, excerpt, body_markdown, cover_image_url, author, published_at, updated_at)
SELECT
  'Ignium Motorsport Launches Live Race Control',
  'ignium-live-race-control-launch',
  'A new operations hub for race timing, stream tracking, and results sync.',
  'Ignium Motorsport is launching **Live Race Control**, bringing driver streams, event timing, and race result history together in one place.\n\nThis MVP focuses on reliability: pages are powered from our own data store, while GridRep provides iRacing-derived session and result sync.\n\nMore live telemetry integration is coming through our planned local relay app.',
  'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1200&q=80',
  'Ignium Motorsport',
  datetime('now'),
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE slug = 'ignium-live-race-control-launch');

INSERT INTO live_timing_snapshots (
  event_id,
  car_number,
  driver_name,
  position,
  class_position,
  lap,
  last_lap,
  best_lap,
  gap,
  interval,
  pit_status,
  stream_url
)
SELECT
  e.id,
  '23',
  'Mac Cherry',
  7,
  5,
  52,
  '1:20.114',
  '1:19.083',
  '+21.2',
  '+0.7',
  'on track',
  'https://www.youtube.com/@BudgetDadRacing'
FROM events e
WHERE e.slug = 'imsa-endurance-long-beach-demo'
  AND NOT EXISTS (
    SELECT 1 FROM live_timing_snapshots l
    WHERE l.event_id = e.id AND l.driver_name = 'Mac Cherry' AND l.lap = 52
  );
