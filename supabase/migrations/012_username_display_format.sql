-- Capitalize display names (e.g. fitalya → Fitalya). Usernames stay lowercase.

alter table public.profiles
  add column if not exists display_name text;

-- Undo mistaken username capitalization if an earlier draft of migration 012 ran.
drop index if exists public.profiles_username_lower_unique;

alter table public.profiles drop constraint if exists username_format;

update public.profiles
set username = lower(username)
where username ~ '[A-Z]';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_username_key'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles add constraint profiles_username_key unique (username);
  end if;
end $$;

alter table public.profiles
  add constraint username_format check (
    username ~ '^[a-z0-9_]{3,30}$'
  );

update public.profiles
set display_name = upper(left(trim(source_name), 1)) || substring(trim(source_name) from 2)
from (
  select
    id,
    coalesce(nullif(trim(display_name), ''), username) as source_name
  from public.profiles
) formatted
where public.profiles.id = formatted.id
  and formatted.source_name <> '';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  raw_username text;
  raw_display_name text;
  formatted_display_name text;
begin
  raw_username := lower(trim(new.raw_user_meta_data ->> 'username'));
  if raw_username is null or raw_username = '' then
    raise exception 'username required';
  end if;

  raw_display_name := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');

  if raw_display_name is not null then
    formatted_display_name :=
      upper(left(raw_display_name, 1)) || substring(raw_display_name from 2);
  else
    formatted_display_name :=
      upper(left(raw_username, 1)) || substring(raw_username from 2);
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, raw_username, formatted_display_name);
  return new;
end;
$$;
