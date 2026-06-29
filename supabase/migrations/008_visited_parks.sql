-- Parks visited by users (national parks and theme parks — separate from cities).
create table public.visited_parks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  park_name text not null,
  park_type text not null check (park_type in ('national_park', 'theme_park')),
  country_code char(2) not null,
  country_name text not null,
  latitude double precision,
  longitude double precision,
  note text,
  media_type text check (media_type in ('photo', 'instagram')),
  media_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint visited_parks_note_length check (note is null or char_length(note) <= 1000),
  constraint visited_parks_single_media check (
    (media_type is null and media_url is null)
    or (media_type is not null and media_url is not null)
  )
);

create index visited_parks_user_id_idx on public.visited_parks(user_id);
create index visited_parks_country_code_idx on public.visited_parks(country_code);

create trigger visited_parks_updated_at
  before update on public.visited_parks
  for each row execute procedure public.set_updated_at();

alter table public.visited_parks enable row level security;

create policy "Visited parks are publicly readable"
  on public.visited_parks for select using (true);

create policy "Users can insert own parks"
  on public.visited_parks for insert with check (auth.uid() = user_id);

create policy "Users can update own parks"
  on public.visited_parks for update using (auth.uid() = user_id);

create policy "Users can delete own parks"
  on public.visited_parks for delete using (auth.uid() = user_id);
