-- Cached thumbnail for Instagram posts (og/oEmbed preview image URL)
alter table public.visited_cities
  add column if not exists media_preview_url text;
