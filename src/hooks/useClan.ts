import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clan, ClanMember, DailyChampion, WeeklyMVP } from '@/types/clan';
import { AvatarType, EnergyLevel } from '@/types/avatar';

export function useClan() {
  const [clan, setClan] = useState<Clan | null>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [dailyChampion, setDailyChampion] = useState<DailyChampion | null>(null);
  const [weeklyMVP, setWeeklyMVP] = useState<WeeklyMVP | null>(null);
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [goalMet, setGoalMet] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const loadClanData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      // Get user's clan membership
      const { data: membership } = await supabase
        .from('clan_members')
        .select('clan_id')
        .eq('user_id', user.id)
        .single();

      if (!membership) {
        setClan(null);
        setIsLoading(false);
        return;
      }

      // Get clan details
      const { data: clanData } = await supabase
        .from('clans')
        .select('*')
        .eq('id', membership.clan_id)
        .single();

      if (clanData) {
        setClan(clanData as Clan);
      }

      // Get all clan members with profiles
      const { data: membersData } = await supabase
        .from('clan_members')
        .select(`
          id,
          user_id,
          clan_id,
          joined_at
        `)
        .eq('clan_id', membership.clan_id);

      if (!membersData) {
        setIsLoading(false);
        return;
      }

      // Get profiles for all members - SINGLE SOURCE OF TRUTH for avatar data
      const userIds = membersData.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_type, avatar_level, avatar_energy, current_streak, best_streak')
        .in('id', userIds);

      // Get today's screen time for all members
      const { data: todayEntries } = await supabase
        .from('screen_time_entries')
        .select('user_id, actual_minutes')
        .in('user_id', userIds)
        .eq('date', today);

      // Get yesterday's screen time for movement indicators
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const { data: yesterdayEntries } = await supabase
        .from('screen_time_entries')
        .select('user_id, actual_minutes')
        .in('user_id', userIds)
        .eq('date', yesterdayStr);

      // Build member list with contributions - profile data is the SINGLE SOURCE OF TRUTH
      const membersWithData: ClanMember[] = membersData.map(member => {
        const profile = profiles?.find(p => p.id === member.user_id);
        const todayEntry = todayEntries?.find(e => e.user_id === member.user_id);
        const yesterdayEntry = yesterdayEntries?.find(e => e.user_id === member.user_id);
        
        // Calculate reduction as contribution (baseline - actual)
        const todayMinutes = todayEntry?.actual_minutes || 0;
        const yesterdayMinutes = yesterdayEntry?.actual_minutes || 0;

        return {
          id: member.id,
          user_id: member.user_id,
          clan_id: member.clan_id,
          joined_at: member.joined_at,
          profile: {
            id: profile?.id || member.user_id,
            username: profile?.username || 'Unknown',
            avatar_type: (profile?.avatar_type as AvatarType) || 'fire',
            avatar_level: profile?.avatar_level || 1,
            avatar_energy: (profile?.avatar_energy as EnergyLevel) || 'medium',
            current_streak: profile?.current_streak || 0,
            best_streak: profile?.best_streak || 0,
          },
          todayMinutes,
          yesterdayMinutes,
          rank: 0,
          previousRank: 0,
          movement: 'same' as const,
          reactions: [],
        };
      });

      // Sort by today's contribution (lower screen time = better contribution)
      // We invert so lower actual_minutes = higher rank
      membersWithData.sort((a, b) => a.todayMinutes - b.todayMinutes);
      
      // Assign ranks
      membersWithData.forEach((member, index) => {
        member.rank = index + 1;
      });

      // Calculate previous ranks based on yesterday
      const sortedByYesterday = [...membersWithData].sort((a, b) => a.yesterdayMinutes - b.yesterdayMinutes);
      sortedByYesterday.forEach((member, index) => {
        const currentMember = membersWithData.find(m => m.user_id === member.user_id);
        if (currentMember) {
          currentMember.previousRank = index + 1;
          
          // Determine movement
          if (currentMember.previousRank === 0) {
            currentMember.movement = 'new';
          } else if (currentMember.rank < currentMember.previousRank) {
            currentMember.movement = 'up';
          } else if (currentMember.rank > currentMember.previousRank) {
            currentMember.movement = 'down';
          } else {
            currentMember.movement = 'same';
          }
        }
      });

      setMembers(membersWithData);

      // Find current user's rank
      const currentUserRank = membersWithData.find(m => m.user_id === user.id)?.rank || 0;
      setUserRank(currentUserRank);

      // Calculate total contribution today
      const totalToday = membersWithData.reduce((sum, m) => sum + m.todayMinutes, 0);
      setTodayTotal(totalToday);

      // Check if goal is met (total under daily_goal_minutes * member count)
      if (clanData) {
        const goalTarget = clanData.daily_goal_minutes * membersWithData.length;
        setGoalMet(totalToday <= goalTarget);
      }

      // Find daily champion (lowest screen time today)
      if (membersWithData.length > 0 && membersWithData[0].todayMinutes > 0) {
        const champion = membersWithData[0];
        setDailyChampion({
          user_id: champion.user_id,
          username: champion.profile.username,
          avatar_type: champion.profile.avatar_type,
          avatar_level: champion.profile.avatar_level,
          avatar_energy: champion.profile.avatar_energy,
          contribution: champion.todayMinutes,
        });
      }

      // Find weekly MVP (most consistent low usage)
      const { data: weeklyEntries } = await supabase
        .from('screen_time_entries')
        .select('user_id, actual_minutes, date')
        .in('user_id', userIds)
        .gte('date', weekStartStr)
        .lte('date', today);

      if (weeklyEntries && weeklyEntries.length > 0) {
        const weeklyTotals: Record<string, { total: number; days: number }> = {};
        weeklyEntries.forEach(entry => {
          if (!weeklyTotals[entry.user_id]) {
            weeklyTotals[entry.user_id] = { total: 0, days: 0 };
          }
          weeklyTotals[entry.user_id].total += entry.actual_minutes || 0;
          weeklyTotals[entry.user_id].days += 1;
        });

        let bestMVP: { userId: string; avgMinutes: number; days: number } | null = null;
        Object.entries(weeklyTotals).forEach(([userId, data]) => {
          const avgMinutes = data.total / data.days;
          if (!bestMVP || (data.days >= 3 && avgMinutes < bestMVP.avgMinutes)) {
            bestMVP = { userId, avgMinutes, days: data.days };
          }
        });

        if (bestMVP) {
          const mvpMember = membersWithData.find(m => m.user_id === bestMVP!.userId);
          if (mvpMember) {
            setWeeklyMVP({
              user_id: mvpMember.user_id,
              username: mvpMember.profile.username,
              avatar_type: mvpMember.profile.avatar_type,
              avatar_level: mvpMember.profile.avatar_level,
              avatar_energy: mvpMember.profile.avatar_energy,
              totalContribution: weeklyTotals[bestMVP.userId].total,
              daysActive: weeklyTotals[bestMVP.userId].days,
            });
          }
        }
      }

    } catch (error) {
      console.error('Error loading clan data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [today, weekStartStr]);

  useEffect(() => {
    loadClanData();
  }, [loadClanData]);

  // Real-time subscription for screen time updates AND profile changes
  useEffect(() => {
    if (!clan) return;

    const channel = supabase
      .channel('clan-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'screen_time_entries',
        },
        () => {
          loadClanData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          // Refresh when any profile is updated (avatar changes, etc.)
          loadClanData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clan, loadClanData]);

  return {
    clan,
    members,
    userRank,
    dailyChampion,
    weeklyMVP,
    todayTotal,
    goalMet,
    isLoading,
    userId,
    refresh: loadClanData,
  };
}
