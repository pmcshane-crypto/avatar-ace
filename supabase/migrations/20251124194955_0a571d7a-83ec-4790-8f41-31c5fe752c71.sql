-- Create table to track purchased avatars
CREATE TABLE public.purchased_avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  avatar_type text NOT NULL,
  purchased_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, avatar_type)
);

-- Enable RLS
ALTER TABLE public.purchased_avatars ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
ON public.purchased_avatars
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own purchases (will be done via edge function)
CREATE POLICY "Users can insert own purchases"
ON public.purchased_avatars
FOR INSERT
WITH CHECK (auth.uid() = user_id);