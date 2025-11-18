-- Add notification settings to profiles table
alter table public.profiles
add column if not exists notification_enabled boolean default true;

-- Add comment
comment on column public.profiles.notification_enabled is 'ブラウザ通知のオン/オフ設定';
