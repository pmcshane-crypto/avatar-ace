-- Add avatar_xp and avatar_energy columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_xp integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS avatar_energy text NOT NULL DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reduction numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekly_average integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_sync_at timestamp with time zone DEFAULT now();

-- Add constraint for avatar_energy valid values
ALTER TABLE public.profiles 
ADD CONSTRAINT avatar_energy_check CHECK (avatar_energy IN ('high', 'medium', 'low'));

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;