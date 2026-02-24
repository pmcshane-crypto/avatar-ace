import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GlobalRankData {
  userRank: number;
  totalUsers: number;
  reductionPercent: number;
  isLoading: boolean;
}

export function useGlobalRanking(userId: string | null) {
  const [rankData, setRankData] = useState<GlobalRankData>({
    userRank: 0,
    totalUsers: 0,
    reductionPercent: 0,
    isLoading: true,
  });

  useEffect(() => {
    if (!userId) return;

    const fetchGlobalRank = async () => {
      const today = new Date().toISOString().split('T')[0];

      // Get today's entry for current user
      const { data: myEntry } = await supabase
        .from('screen_time_entries')
        .select('actual_minutes, user_id')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      // Get my baseline
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('baseline_minutes, total_reduction, weekly_average')
        .eq('id', userId)
        .maybeSingle();

      if (!myProfile) {
        setRankData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const myWeeklyAvg = myProfile.weekly_average || 0;

      // Lower weekly average is better — count users with a lower average
      const { count: usersAhead } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('weekly_average', myWeeklyAvg)
        .gt('weekly_average', 0);

      // Count total active users (have a weekly_average > 0)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('weekly_average', 0);

      setRankData({
        userRank: (usersAhead || 0) + 1,
        totalUsers: totalUsers || 1,
        reductionPercent: myProfile.total_reduction || 0,
        isLoading: false,
      });
    };

    fetchGlobalRank();

    // Refresh every 5 minutes
    const interval = setInterval(fetchGlobalRank, 300000);
    return () => clearInterval(interval);
  }, [userId]);

  return rankData;
}
