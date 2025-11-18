-- Fix search_path for calculate_reduction function
drop function if exists public.calculate_reduction(integer, integer);

create or replace function public.calculate_reduction(
  baseline integer,
  actual integer
)
returns numeric
language sql
immutable
security definer
set search_path = public
as $$
  select case 
    when baseline = 0 then 0
    else round(((baseline - actual)::numeric / baseline::numeric) * 100, 2)
  end;
$$;

-- Fix search_path for get_user_stats function
drop function if exists public.get_user_stats(uuid);

create or replace function public.get_user_stats(p_user_id uuid)
returns table (
  current_streak integer,
  best_streak integer,
  total_reduction numeric,
  weekly_average integer
)
language plpgsql
security definer
set search_path = public
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