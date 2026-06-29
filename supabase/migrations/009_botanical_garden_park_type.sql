-- Allow botanical gardens as a third park type (Wikidata Q167346).
alter table public.visited_parks
  drop constraint if exists visited_parks_park_type_check;

alter table public.visited_parks
  add constraint visited_parks_park_type_check
  check (park_type in ('national_park', 'theme_park', 'botanical_garden'));
