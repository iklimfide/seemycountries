-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  created_at timestamptz default now() not null,
  constraint username_format check (
    username ~ '^[a-z0-9_]{3,30}$'
  )
);

-- Visited cities with single media + note
create table public.visited_cities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  city_name text not null,
  country_code char(2) not null,
  country_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  note text,
  media_type text check (media_type in ('photo', 'instagram')),
  media_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint note_length check (note is null or char_length(note) <= 1000),
  constraint single_media check (
    (media_type is null and media_url is null)
    or (media_type is not null and media_url is not null)
  )
);

create index visited_cities_user_id_idx on public.visited_cities(user_id);
create index profiles_username_idx on public.profiles(username);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger visited_cities_updated_at
  before update on public.visited_cities
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.visited_cities enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Visited cities are publicly readable"
  on public.visited_cities for select using (true);

create policy "Users can insert own cities"
  on public.visited_cities for insert with check (auth.uid() = user_id);

create policy "Users can update own cities"
  on public.visited_cities for update using (auth.uid() = user_id);

create policy "Users can delete own cities"
  on public.visited_cities for delete using (auth.uid() = user_id);

-- Storage bucket for city photos (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('city-media', 'city-media', true);
