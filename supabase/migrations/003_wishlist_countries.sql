-- Profile setting: show wishlist on public profile (must exist before RLS policy below)
alter table public.profiles
  add column if not exists wishlist_public boolean not null default false;

-- Wishlist countries (want to visit)
create table if not exists public.wishlist_countries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  country_code char(2) not null,
  country_name text not null,
  created_at timestamptz default now() not null,
  unique (user_id, country_code)
);

create index if not exists wishlist_countries_user_id_idx on public.wishlist_countries(user_id);

alter table public.wishlist_countries enable row level security;

drop policy if exists "Wishlist countries readable when owner or public" on public.wishlist_countries;
create policy "Wishlist countries readable when owner or public"
  on public.wishlist_countries for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = wishlist_countries.user_id
        and p.wishlist_public = true
    )
  );

drop policy if exists "Users can insert own wishlist countries" on public.wishlist_countries;
create policy "Users can insert own wishlist countries"
  on public.wishlist_countries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlist countries" on public.wishlist_countries;
create policy "Users can delete own wishlist countries"
  on public.wishlist_countries for delete
  using (auth.uid() = user_id);
