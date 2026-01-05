-- Add unique constraint on user_id and date for screen_time_entries
-- This allows proper upsert behavior for daily entries
ALTER TABLE public.screen_time_entries 
ADD CONSTRAINT screen_time_entries_user_date_unique 
UNIQUE (user_id, date);