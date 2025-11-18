-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger for auto-creating profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to create notification when post is created
create or replace function public.create_notification_on_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, post_id)
  values (new.recipient_id, new.id);
  return new;
end;
$$;

-- Trigger for creating notification
drop trigger if exists on_post_created on public.posts;
create trigger on_post_created
  after insert on public.posts
  for each row
  execute function public.create_notification_on_post();

-- Function to get weekly points remaining
create or replace function public.get_remaining_points(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week_start date;
  v_total_sent integer;
begin
  -- Get the start of the current week (Monday)
  v_week_start := date_trunc('week', current_date)::date;
  
  -- Get total points sent this week
  select coalesce(total_sent, 0) into v_total_sent
  from public.weekly_points
  where user_id = p_user_id and week_start = v_week_start;
  
  -- Return remaining points (100 - sent)
  return 100 - coalesce(v_total_sent, 0);
end;
$$;
