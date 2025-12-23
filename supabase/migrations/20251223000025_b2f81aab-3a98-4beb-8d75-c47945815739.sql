-- Add avatar_level column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar_level integer NOT NULL DEFAULT 1;

-- Add a constraint to ensure avatar_level is between 1 and 3
ALTER TABLE public.profiles 
ADD CONSTRAINT avatar_level_range CHECK (avatar_level >= 1 AND avatar_level <= 3);