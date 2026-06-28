-- Extended profile fields for public traveler pages
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists residence text,
  add column if not exists profession text,
  add column if not exists marital_status text;

alter table public.profiles
  add constraint profiles_bio_length check (bio is null or char_length(bio) <= 500),
  add constraint profiles_residence_length check (residence is null or char_length(residence) <= 100),
  add constraint profiles_profession_length check (profession is null or char_length(profession) <= 100),
  add constraint profiles_marital_status_length check (marital_status is null or char_length(marital_status) <= 50),
  add constraint profiles_display_name_length check (display_name is null or char_length(display_name) <= 50);

-- Avatar storage bucket: see 005_avatars_storage.sql
