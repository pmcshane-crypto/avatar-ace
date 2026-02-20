
-- Fix #1: Clan creators can manage their clans
CREATE POLICY "Clan creators can update their clans"
ON public.clans
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Clan creators can delete their clans"
ON public.clans
FOR DELETE
USING (auth.uid() = created_by);

-- Fix #2: Restrict screen time data access
DROP POLICY "Anyone can view screen time entries" ON public.screen_time_entries;

CREATE POLICY "Users can view own screen time"
ON public.screen_time_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Clan members can view each others screen time"
ON public.screen_time_entries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clan_members cm1
    JOIN public.clan_members cm2 ON cm1.clan_id = cm2.clan_id
    WHERE cm1.user_id = auth.uid()
    AND cm2.user_id = screen_time_entries.user_id
  )
);

-- Fix #3: Input validation constraints (skipping screen time since it'll be automated via iOS)
ALTER TABLE public.clans 
ADD CONSTRAINT clan_name_length CHECK (length(name) <= 30 AND length(name) > 0),
ADD CONSTRAINT clan_description_length CHECK (description IS NULL OR length(description) <= 200),
ADD CONSTRAINT daily_goal_range CHECK (daily_goal_minutes BETWEEN 30 AND 480);

ALTER TABLE public.profiles
ADD CONSTRAINT username_length CHECK (length(username) <= 50 AND length(username) > 0),
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$');
