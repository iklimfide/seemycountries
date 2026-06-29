-- Allow name-only cities when geocoding fails (listed in profile, no map pin).
alter table public.visited_cities
  alter column latitude drop not null,
  alter column longitude drop not null;
