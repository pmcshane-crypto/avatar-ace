
-- Drop the overly permissive insert policy and replace with user-scoped one
DROP POLICY "Service role can insert notifications" ON public.notifications;

-- Users can insert their own notifications (for client-side milestone triggers)
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
