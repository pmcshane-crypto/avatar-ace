-- Enable RLS
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_type text not null check (avatar_type in ('fire', 'water', 'nature')),
  baseline_minutes integer not null default 0,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Clans table
create table public.clans (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table public.clans enable row level security;

create policy "Anyone can view clans"
  on public.clans for select
  using (true);

create policy "Authenticated users can create clans"
  on public.clans for insert
  with check (auth.uid() = created_by);

-- Clan members table
create table public.clan_members (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid references public.clans(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  unique(clan_id, user_id)
);

alter table public.clan_members enable row level security;

create policy "Anyone can view clan members"
  on public.clan_members for select
  using (true);

create policy "Users can join clans"
  on public.clan_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave clans"
  on public.clan_members for delete
  using (auth.uid() = user_id);

-- Screen time entries table
create table public.screen_time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null,
  total_minutes integer not null,
  music_minutes integer default 0,
  better_buddy_minutes integer default 0,
  actual_minutes integer generated always as (total_minutes - music_minutes - better_buddy_minutes) stored,
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

alter table public.screen_time_entries enable row level security;

create policy "Anyone can view screen time entries"
  on public.screen_time_entries for select
  using (true);

create policy "Users can insert own screen time"
  on public.screen_time_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own screen time"
  on public.screen_time_entries for update
  using (auth.uid() = user_id);

-- Function to calculate daily reduction percentage
create or replace function public.calculate_reduction(
  baseline integer,
  actual integer
)
returns numeric
language sql
immutable
as $$
  select case 
    when baseline = 0 then 0
    else round(((baseline - actual)::numeric / baseline::numeric) * 100, 2)
  end;
$$;

-- Function to get user stats
create or replace function public.get_user_stats(p_user_id uuid)
returns table (
  current_streak integer,
  best_streak integer,
  total_reduction numeric,
  weekly_average integer
)
language plpgsql
as $$
declare
  v_baseline integer;
  v_current_date date;
  v_streak_count integer := 0;
  v_max_streak integer := 0;
  v_temp_streak integer := 0;
begin
  -- Get baseline
  select baseline_minutes into v_baseline
  from public.profiles
  where id = p_user_id;

  -- Calculate current streak
  v_current_date := current_date;
  loop
    if exists (
      select 1 from public.screen_time_entries
      where user_id = p_user_id
        and date = v_current_date
        and actual_minutes < v_baseline
    ) then
      v_streak_count := v_streak_count + 1;
      v_current_date := v_current_date - interval '1 day';
    else
      exit;
    end if;
  end loop;

  -- Calculate best streak
  for v_current_date in 
    select date 
    from public.screen_time_entries 
    where user_id = p_user_id 
    order by date
  loop
    if (select actual_minutes from public.screen_time_entries where user_id = p_user_id and date = v_current_date) < v_baseline then
      v_temp_streak := v_temp_streak + 1;
      if v_temp_streak > v_max_streak then
        v_max_streak := v_temp_streak;
      end if;
    else
      v_temp_streak := 0;
    end if;
  end loop;

  return query
  select
    v_streak_count as current_streak,
    v_max_streak as best_streak,
    coalesce(
      (select calculate_reduction(v_baseline, avg(actual_minutes)::integer)
       from public.screen_time_entries
       where user_id = p_user_id),
      0
    ) as total_reduction,
    coalesce(
      (select avg(actual_minutes)::integer
       from public.screen_time_entries
       where user_id = p_user_id
         and date >= current_date - interval '7 days'),
      v_baseline
    ) as weekly_average;
end;
$$;