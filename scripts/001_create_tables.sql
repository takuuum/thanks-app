-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Create posts table (感謝のメッセージ)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  points integer not null check (points > 0 and points <= 100),
  created_at timestamptz default now()
);

-- Create weekly_points table (週ごとのポイント管理)
create table if not exists public.weekly_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  total_sent integer default 0 check (total_sent >= 0 and total_sent <= 100),
  created_at timestamptz default now(),
  unique(user_id, week_start)
);

-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.weekly_points enable row level security;
alter table public.notifications enable row level security;

-- Profiles policies
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Posts policies
create policy "posts_select_all"
  on public.posts for select
  using (true);

create policy "posts_insert_own"
  on public.posts for insert
  with check (auth.uid() = sender_id);

create policy "posts_update_own"
  on public.posts for update
  using (auth.uid() = sender_id);

create policy "posts_delete_own"
  on public.posts for delete
  using (auth.uid() = sender_id);

-- Weekly points policies
create policy "weekly_points_select_all"
  on public.weekly_points for select
  using (true);

create policy "weekly_points_insert_own"
  on public.weekly_points for insert
  with check (auth.uid() = user_id);

create policy "weekly_points_update_own"
  on public.weekly_points for update
  using (auth.uid() = user_id);

-- Notifications policies
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "notifications_insert_for_recipient"
  on public.notifications for insert
  with check (true);

-- Create indexes for performance
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_sender on public.posts(sender_id);
create index if not exists idx_posts_recipient on public.posts(recipient_id);
create index if not exists idx_weekly_points_user_week on public.weekly_points(user_id, week_start);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read);
