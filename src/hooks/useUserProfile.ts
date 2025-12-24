import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  username: string;
  avatar_type: string;
  avatar_level: number;
  avatar_xp: number;
  avatar_energy: 'high' | 'medium' | 'low';
  baseline_minutes: number;
  current_streak: number;
  best_streak: number;
  total_reduction: number;
  weekly_average: number;
  last_sync_at: string | null;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  syncStats: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// XP thresholds per level
export const getXpToNextLevel = (level: number): number => {
  if (level >= 3) return 600; // Max level
  return level === 1 ? 200 : level === 2 ? 400 : 600;
};

export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          username: data.username,
          avatar_type: data.avatar_type,
          avatar_level: data.avatar_level,
          avatar_xp: data.avatar_xp ?? 0,
          avatar_energy: (data.avatar_energy as 'high' | 'medium' | 'low') ?? 'medium',
          baseline_minutes: data.baseline_minutes,
          current_streak: data.current_streak ?? 0,
          best_streak: data.best_streak ?? 0,
          total_reduction: data.total_reduction ?? 0,
          weekly_average: data.weekly_average ?? data.baseline_minutes,
          last_sync_at: data.last_sync_at,
        });
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update local state immediately
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Sync Error',
        description: 'Failed to sync your progress. Please try again.',
        variant: 'destructive',
      });
    }
  }, [profile, toast]);

  const syncStats = useCallback(async () => {
    if (!profile) return;

    try {
      // Call the database function to compute stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_stats', { p_user_id: profile.id });

      if (statsError) throw statsError;

      if (statsData && statsData.length > 0) {
        const stats = statsData[0];
        await updateProfile({
          current_streak: stats.current_streak,
          best_streak: stats.best_streak,
          total_reduction: stats.total_reduction,
          weekly_average: stats.weekly_average,
        });
      }
    } catch (err) {
      console.error('Error syncing stats:', err);
    }
  }, [profile, updateProfile]);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    await fetchProfile();
  }, [fetchProfile]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Set up realtime subscription
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          console.log('Profile updated via realtime:', payload);
          const newData = payload.new as any;
          setProfile(prev => prev ? {
            ...prev,
            ...newData,
            avatar_energy: newData.avatar_energy ?? prev.avatar_energy,
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    syncStats,
    refreshProfile,
  };
}
