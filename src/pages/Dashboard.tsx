import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AvatarCard } from "@/components/AvatarCard";
import { ScreenTimeInput } from "@/components/ScreenTimeInput";
import { StatsCard } from "@/components/StatsCard";
import { DailyMomentCard } from "@/components/DailyMomentCard";
import { Avatar, AvatarType, UserStats } from "@/types/avatar";
import { useToast } from "@/hooks/use-toast";
import { Users, RefreshCw, Smartphone } from "lucide-react";
import { useScreenTime } from "@/hooks/useScreenTime";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { screenTimeData, hasPermission, isLoading, refreshScreenTime } = useScreenTime();
  const [userId, setUserId] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<Avatar>({
    id: '1',
    type: (localStorage.getItem('selectedAvatarType') as AvatarType) || 'water',
    name: 'Your Buddy',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    energy: 'medium',
    description: 'Your loyal companion on the journey to reduce screen time',
  });

  const [stats, setStats] = useState<UserStats>({
    baseline: parseInt(localStorage.getItem('baseline') || '300'),
    currentStreak: 0,
    bestStreak: 0,
    totalReduction: 0,
    weeklyAverage: screenTimeData.weeklyAverage || parseInt(localStorage.getItem('baseline') || '300'),
  });

  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [todayEntrySaved, setTodayEntrySaved] = useState(false);

  // Load user data from Supabase on mount
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setAvatar(prev => ({
          ...prev,
          type: profile.avatar_type as AvatarType,
          level: profile.avatar_level,
          xp: profile.avatar_xp,
          xpToNextLevel: profile.avatar_level * 100,
          energy: profile.avatar_energy as 'high' | 'medium' | 'low',
        }));
        setStats(prev => ({
          ...prev,
          baseline: profile.baseline_minutes,
          currentStreak: profile.current_streak,
          bestStreak: profile.best_streak,
          totalReduction: Number(profile.total_reduction) || 0,
          weeklyAverage: profile.weekly_average,
        }));
      }

      // Check if today's entry exists
      const today = new Date().toISOString().split('T')[0];
      const { data: todayEntry } = await supabase
        .from('screen_time_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (todayEntry) {
        setTodayEntrySaved(true);
      }
    };

    loadUserData();
  }, [navigate]);

  // Auto-update when screen time data changes (iOS auto-sync)
  useEffect(() => {
    if (screenTimeData.isAutomatic && userId) {
      handleScreenTimeSubmit({
        totalMinutes: screenTimeData.totalMinutes,
        musicMinutes: screenTimeData.musicMinutes,
        betterBuddyMinutes: screenTimeData.betterBuddyMinutes,
      });
      setStats(prev => ({
        ...prev,
        weeklyAverage: screenTimeData.weeklyAverage,
      }));
    }
  }, [screenTimeData, userId]);

  const handleScreenTimeSubmit = async (data: {
    totalMinutes: number;
    musicMinutes: number;
    betterBuddyMinutes: number;
  }) => {
    if (!userId) return;

    const actualMinutes = data.totalMinutes - data.musicMinutes - data.betterBuddyMinutes;
    const reduction = ((stats.baseline - actualMinutes) / stats.baseline) * 100;

    // Save to database with upsert (unique constraint on user_id, date)
    const today = new Date().toISOString().split('T')[0];
    
    const { error: entryError } = await supabase
      .from('screen_time_entries')
      .upsert({
        user_id: userId,
        date: today,
        total_minutes: data.totalMinutes,
        music_minutes: data.musicMinutes,
        better_buddy_minutes: data.betterBuddyMinutes,
      }, { onConflict: 'user_id,date' });

    if (entryError) {
      console.error('Error saving screen time:', entryError);
      toast({
        title: "Error saving",
        description: "Could not save your screen time. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setTodayEntrySaved(true);

    // Update avatar energy based on reduction
    let newEnergy: 'high' | 'medium' | 'low' = 'medium';
    if (reduction > 20) newEnergy = 'high';
    else if (reduction < 0) newEnergy = 'low';

    // Calculate XP change - linear and symmetric for gains and losses
    const xpChange = Math.floor(reduction * 2);
    let newXp = avatar.xp + xpChange;
    let newLevel = avatar.level;

    // Handle level up
    if (newXp >= avatar.xpToNextLevel) {
      newLevel += 1;
      newXp = newXp - avatar.xpToNextLevel;
      setIsLevelingUp(true);
      setTimeout(() => setIsLevelingUp(false), 3000);
    }
    
    // Handle level down
    while (newXp < 0 && newLevel > 1) {
      newLevel -= 1;
      const prevLevelXpRequired = newLevel * 100;
      newXp = prevLevelXpRequired + newXp;
    }
    
    if (newLevel === 1 && newXp < 0) {
      newXp = 0;
    }

    // Update profile in database
    await supabase
      .from('profiles')
      .update({
        avatar_level: newLevel,
        avatar_xp: newXp,
        avatar_energy: newEnergy,
        current_streak: reduction > 0 ? stats.currentStreak + 1 : 0,
        best_streak: Math.max(stats.bestStreak, reduction > 0 ? stats.currentStreak + 1 : 0),
        total_reduction: Math.floor(reduction),
      })
      .eq('id', userId);

    setAvatar({
      ...avatar,
      energy: newEnergy,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newLevel * 100,
    });

    const newStreak = reduction > 0 ? stats.currentStreak + 1 : 0;
    setStats({
      ...stats,
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      totalReduction: Math.floor(reduction),
    });

    // Show toast
    if (xpChange > 0) {
      toast({
        title: "Great job! 🎉",
        description: `You reduced screen time by ${Math.floor(reduction)}%! Your avatar gained ${xpChange} XP!`,
      });
    } else if (xpChange < 0) {
      const levelDownMessage = newLevel < avatar.level 
        ? ` Your avatar dropped to level ${newLevel}!` 
        : '';
      toast({
        title: "Your buddy needs help! 😔",
        description: `You went over your baseline. Your avatar lost ${Math.abs(xpChange)} XP.${levelDownMessage}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Right on target! 👍",
        description: "You matched your baseline exactly!",
      });
    }
  };

  const getBackgroundClass = () => {
    switch (avatar.type) {
      case 'fire':
        return 'bg-gradient-fire-bg';
      case 'water':
        return 'bg-gradient-water-bg';
      case 'nature':
        return 'bg-gradient-nature-bg';
      default:
        return 'bg-background';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()} p-6 transition-all duration-700`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Better Buddy</h1>
          <p className="text-muted-foreground">Your screen time companion</p>
          {Capacitor.getPlatform() === 'ios' && screenTimeData.isAutomatic && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <Smartphone className="w-4 h-4" />
              <span>Auto-synced with iOS Screen Time</span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => navigate("/clans")}
            variant="outline"
            size="lg"
            className="text-lg px-8"
          >
            <Users className="w-5 h-5 mr-2" />
            View My Clans
          </Button>
        </div>

        {/* Daily Moment of Truth Card */}
        <DailyMomentCard 
          reduction={stats.totalReduction}
          hasClans={false}
        />

        {Capacitor.getPlatform() === 'ios' && hasPermission && (
          <Button
            onClick={refreshScreenTime}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Sync Screen Time'}
          </Button>
        )}

        {/* Avatar Display */}
        <div className={`bg-black rounded-3xl p-8 transition-all duration-500 ${
          isLevelingUp 
            ? 'shadow-[0_0_60px_hsl(var(--primary)/0.8),0_0_100px_hsl(var(--accent)/0.6)] scale-105' 
            : 'shadow-glow'
        }`}>
          <AvatarCard avatar={avatar} size="lg" />
        </div>

        {/* Stats Grid */}
        <StatsCard stats={stats} />

        {/* Screen Time Input - Only show if not automatic */}
        {!screenTimeData.isAutomatic && (
          <ScreenTimeInput onSubmit={handleScreenTimeSubmit} />
        )}

        {/* Change Better Buddy Button */}
        <Button
          onClick={() => navigate("/avatar-selection")}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Change Better Buddy
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
