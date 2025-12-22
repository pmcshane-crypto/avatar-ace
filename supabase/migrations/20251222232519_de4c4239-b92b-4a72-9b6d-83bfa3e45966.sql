-- Add new columns to clans table for gamification
ALTER TABLE public.clans 
ADD COLUMN IF NOT EXISTS clan_level integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS clan_xp integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS focus_tag text DEFAULT 'All-Around',
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS clan_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_goal_minutes integer NOT NULL DEFAULT 120,
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS icon_emoji text DEFAULT '🔥';

-- Create clan_challenges table
CREATE TABLE public.clan_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'weekly',
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 100,
  reward_description TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clan_challenges
ALTER TABLE public.clan_challenges ENABLE ROW LEVEL SECURITY;

-- RLS policies for clan_challenges
CREATE POLICY "Anyone can view clan challenges"
ON public.clan_challenges
FOR SELECT
USING (true);

CREATE POLICY "Clan creators can manage challenges"
ON public.clan_challenges
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clans 
    WHERE clans.id = clan_challenges.clan_id 
    AND clans.created_by = auth.uid()
  )
);

-- Create clan_messages table for lightweight chat
CREATE TABLE public.clan_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clan_messages
ALTER TABLE public.clan_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for clan_messages
CREATE POLICY "Clan members can view messages"
ON public.clan_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clan_members 
    WHERE clan_members.clan_id = clan_messages.clan_id 
    AND clan_members.user_id = auth.uid()
  )
);

CREATE POLICY "Clan members can send messages"
ON public.clan_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.clan_members 
    WHERE clan_members.clan_id = clan_messages.clan_id 
    AND clan_members.user_id = auth.uid()
  )
);

-- Create challenge_participants table to track individual contributions
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.clan_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  contribution INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on challenge_participants
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenge_participants
CREATE POLICY "Anyone can view challenge participants"
ON public.challenge_participants
FOR SELECT
USING (true);

CREATE POLICY "Users can update own participation"
ON public.challenge_participants
FOR ALL
USING (auth.uid() = user_id);

-- Enable realtime for clan messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_messages;