-- Switch current remote cover URLs to locally hosted static files.
-- This removes runtime dependency on Instagram/Unsplash for existing seeded posts.

UPDATE news_posts
SET cover_image_url = '/news-covers/ignium-live-race-control-launch.jpg'
WHERE slug = 'ignium-live-race-control-launch';

UPDATE news_posts
SET cover_image_url = '/news-covers/instagram-are-you-ready-march-2025.jpg'
WHERE slug = 'instagram-are-you-ready-march-2025';

UPDATE news_posts
SET cover_image_url = '/news-covers/instagram-bart-marotel-4k-irating.jpg'
WHERE slug = 'instagram-bart-marotel-4k-irating';

UPDATE news_posts
SET cover_image_url = '/news-covers/instagram-luke-jones-p2-spa.jpg'
WHERE slug = 'instagram-luke-jones-p2-spa';

UPDATE news_posts
SET cover_image_url = '/news-covers/instagram-motegi-get-series-p3.webp'
WHERE slug = 'instagram-motegi-get-series-p3';

UPDATE news_posts
SET cover_image_url = '/news-covers/instagram-p2-petit-lemans-2025.jpg'
WHERE slug = 'instagram-p2-petit-lemans-2025';

UPDATE news_posts
SET cover_image_url = '/news-covers/instagram-roar-before-24-driver-lineup.jpg'
WHERE slug = 'instagram-roar-before-24-driver-lineup';

UPDATE news_posts
SET cover_image_url = '/news-covers/instagram-sergio-daytona-tcr-victory.jpg'
WHERE slug = 'instagram-sergio-daytona-tcr-victory';

UPDATE news_posts
SET cover_image_url = '/news-covers/instagram-sergio-ferreira-season-4-recognition.jpg'
WHERE slug = 'instagram-sergio-ferreira-season-4-recognition';
