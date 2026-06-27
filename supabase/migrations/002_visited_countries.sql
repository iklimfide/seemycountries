-- Visited countries (marked before adding cities)
create table public.visited_countries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  country_code char(2) not null,
  country_name text not null,
  created_at timestamptz default now() not null,
  unique (user_id, country_code)
);

create index visited_countries_user_id_idx on public.visited_countries(user_id);

alter table public.visited_countries enable row level security;

create policy "Visited countries are publicly readable"
  on public.visited_countries for select using (true);

create policy "Users can insert own countries"
  on public.visited_countries for insert with check (auth.uid() = user_id);

create policy "Users can delete own countries"
  on public.visited_countries for delete using (auth.uid() = user_id);
