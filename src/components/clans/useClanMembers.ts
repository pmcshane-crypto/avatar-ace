import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnrichedClanMember {
  user_id: string;
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
  daily_reduction: number;
  today_minutes: number;
  contribution: number;
  last_active?: string;
}

interface UseClanMembersResult {
  members: EnrichedClanMember[];
  isLoading: boolean;
  error: string | null;
  refreshMembers: () => Promise<void>;
}

export function useClanMembers(clanId: string | null): UseClanMembersResult {
  const [members, setMembers] = useState<EnrichedClanMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!clanId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch clan members with their full profile data
      const { data: memberData, error: memberError } = await supabase
        .from('clan_members')
        .select(`
          user_id,
          profiles!inner(
            username,
            avatar_type,
            avatar_level,
            avatar_xp,
            avatar_energy,
            baseline_minutes,
            current_streak,
            best_streak,
            total_reduction,
            weekly_average
          )
        `)
        .eq('clan_id', clanId);

      if (memberError) throw memberError;

      // Get today's date for screen time lookup
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's screen time entries for all members
      const userIds = memberData?.map(m => m.user_id) || [];
      const { data: screenTimeData } = await supabase
        .from('screen_time_entries')
        .select('user_id, actual_minutes, total_minutes')
        .eq('date', today)
        .in('user_id', userIds);

      // Create a map for quick lookup
      const screenTimeMap = new Map(
        screenTimeData?.map(st => [st.user_id, st]) || []
      );

      // Transform and enrich data
      const enrichedMembers: EnrichedClanMember[] = (memberData || []).map(m => {
        const profile = m.profiles as any;
        const todayScreenTime = screenTimeMap.get(m.user_id);
        
        // Calculate daily reduction
        const baseline = profile.baseline_minutes || 300;
        const todayMinutes = todayScreenTime?.actual_minutes ?? baseline;
        const dailyReduction = baseline > 0 
          ? Math.round(((baseline - todayMinutes) / baseline) * 100)
          : 0;

        // Calculate contribution (based on reduction + streak bonus)
        const streakMultiplier = 1 + (profile.current_streak || 0) * 0.1;
        const contribution = Math.max(0, Math.round(dailyReduction * 2 * streakMultiplier));

        return {
          user_id: m.user_id || '',
          username: profile.username,
          avatar_type: profile.avatar_type,
          avatar_level: profile.avatar_level || 1,
          avatar_xp: profile.avatar_xp || 0,
          avatar_energy: profile.avatar_energy || 'medium',
          baseline_minutes: baseline,
          current_streak: profile.current_streak || 0,
          best_streak: profile.best_streak || 0,
          total_reduction: profile.total_reduction || 0,
          weekly_average: profile.weekly_average || baseline,
          daily_reduction: Math.max(0, dailyReduction),
          today_minutes: todayMinutes,
          contribution,
          last_active: todayScreenTime ? new Date().toISOString() : undefined,
        };
      });

      // Sort by daily reduction (best performers first)
      enrichedMembers.sort((a, b) => b.daily_reduction - a.daily_reduction);
      
      setMembers(enrichedMembers);
      setError(null);
    } catch (err) {
      console.error('Error fetching clan members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, [clanId]);

  // Initial fetch
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Set up realtime subscription for profile changes
  useEffect(() => {
    if (!clanId) return;

    const channel = supabase
      .channel(`clan-members-${clanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('Profile change detected:', payload);
          // Refresh members when any profile changes
          fetchMembers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'screen_time_entries',
        },
        (payload) => {
          console.log('Screen time change detected:', payload);
          // Refresh members when screen time is logged
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clanId, fetchMembers]);

  return {
    members,
    isLoading,
    error,
    refreshMembers: fetchMembers,
  };
}
