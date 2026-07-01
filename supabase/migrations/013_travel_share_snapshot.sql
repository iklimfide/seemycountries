-- Baseline snapshot for "Travel Update" share deltas (not a social feed).
alter table public.profiles
  add column if not exists travel_share_snapshot jsonb,
  add column if not exists travel_share_snapshot_at timestamptz;

comment on column public.profiles.travel_share_snapshot is
  'Last shared travel stats + visited country codes for progress update deltas.';
comment on column public.profiles.travel_share_snapshot_at is
  'When travel_share_snapshot was last saved after a share or download.';
