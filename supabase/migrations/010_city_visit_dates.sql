-- Month-year visit dates per city (stored as YYYY-MM text, e.g. 2024-11)
alter table public.visited_cities
  add column if not exists visit_dates text[] not null default '{}';

alter table public.visited_cities
  add constraint visited_cities_visit_dates_format check (
    coalesce(
      (
        select bool_and(d ~ '^\d{4}-(0[1-9]|1[0-2])$')
        from unnest(visit_dates) as d
      ),
      true
    )
  );

alter table public.visited_cities
  add constraint visited_cities_visit_dates_max check (
    coalesce(array_length(visit_dates, 1), 0) <= 24
  );
