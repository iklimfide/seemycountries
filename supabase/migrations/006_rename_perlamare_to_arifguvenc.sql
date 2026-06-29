-- Rename production showcase account perlamare -> arifguvenc
update public.profiles
set username = 'arifguvenc'
where username = 'perlamare'
  and not exists (
    select 1 from public.profiles where username = 'arifguvenc'
  );

update auth.users
set raw_user_meta_data = jsonb_set(
  coalesce(raw_user_meta_data, '{}'::jsonb),
  '{username}',
  '"arifguvenc"'
)
where id in (
  select id from public.profiles where username = 'arifguvenc'
);
