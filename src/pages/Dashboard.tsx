import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AvatarCard } from "@/components/AvatarCard";
import { ScreenTimeInput } from "@/components/ScreenTimeInput";
import { StatsCard } from "@/components/StatsCard";
import { Avatar, AvatarType, UserStats } from "@/types/avatar";
import { useToast } from "@/hooks/use-toast";
import { Users, RefreshCw, Smartphone, Loader2 } from "lucide-react";
import { useScreenTime } from "@/hooks/useScreenTime";
import { useUserProfile, getXpToNextLevel } from "@/hooks/useUserProfile";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { screenTimeData, hasPermission, isLoading: screenTimeLoading, refreshScreenTime } = useScreenTime();
  const { profile, isLoading: profileLoading, updateProfile } = useUserProfile();

  // Initialize avatar and stats from profile (database is source of truth)
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  const [isLevelingUp, setIsLevelingUp] = useState(false);

  // Sync from profile when loaded - profile is source of truth
  useEffect(() => {
    if (profile) {
      setAvatar({
        id: '1',
        type: profile.avatar_type as AvatarType,
        name: 'Your Buddy',
        level: profile.avatar_level,
        xp: profile.avatar_xp,
        xpToNextLevel: getXpToNextLevel(profile.avatar_level),
        energy: profile.avatar_energy as 'high' | 'medium' | 'low',
        description: 'Your loyal companion on the journey to reduce screen time',
      });
      setStats({
        baseline: profile.baseline_minutes,
        currentStreak: profile.current_streak,
        bestStreak: profile.best_streak,
        totalReduction: profile.total_reduction,
        weeklyAverage: profile.weekly_average,
      });
    }
  }, [profile]);

  // Auto-update when screen time data changes
  useEffect(() => {
    if (screenTimeData.isAutomatic && profile && avatar && stats) {
      handleScreenTimeSubmit({
        totalMinutes: screenTimeData.totalMinutes,
        musicMinutes: screenTimeData.musicMinutes,
        betterBuddyMinutes: screenTimeData.betterBuddyMinutes,
      });
      setStats(prev => prev ? ({
        ...prev,
        weeklyAverage: screenTimeData.weeklyAverage,
      }) : null);
    }
  }, [screenTimeData, profile]);

  const handleScreenTimeSubmit = async (data: {
    totalMinutes: number;
    musicMinutes: number;
    betterBuddyMinutes: number;
  }) => {
    if (!avatar || !stats) return;
    
    const actualMinutes = data.totalMinutes - data.musicMinutes - data.betterBuddyMinutes;
    const reduction = ((stats.baseline - actualMinutes) / stats.baseline) * 100;

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
      const prevLevelXpRequired = getXpToNextLevel(newLevel);
      newXp = prevLevelXpRequired + newXp;
    }
    
    if (newLevel === 1 && newXp < 0) {
      newXp = 0;
    }

    // Update local state immediately for responsive UI
    setAvatar({
      ...avatar,
      energy: newEnergy,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: getXpToNextLevel(newLevel),
    });

    const newStreak = reduction > 0 ? stats.currentStreak + 1 : 0;
    const newBestStreak = Math.max(stats.bestStreak, newStreak);
    
    setStats({
      ...stats,
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      totalReduction: Math.floor(reduction),
    });

    // Sync to database for clan visibility
    if (profile) {
      await updateProfile({
        avatar_level: newLevel,
        avatar_xp: newXp,
        avatar_energy: newEnergy,
        current_streak: newStreak,
        best_streak: newBestStreak,
        total_reduction: Math.floor(reduction),
        weekly_average: stats.weeklyAverage,
      });

      // Also save to screen_time_entries for historical tracking
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('screen_time_entries')
        .upsert({
          user_id: profile.id,
          date: today,
          total_minutes: data.totalMinutes,
          music_minutes: data.musicMinutes,
          better_buddy_minutes: data.betterBuddyMinutes,
          actual_minutes: actualMinutes,
        }, { onConflict: 'user_id,date' });
    }

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
    if (!avatar) return 'bg-background';
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

  // Show loading state while profile is loading
  if (profileLoading || !avatar || !stats) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your Better Buddy...</span>
        </div>
      </div>
    );
  }

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

        {Capacitor.getPlatform() === 'ios' && hasPermission && (
          <Button
            onClick={refreshScreenTime}
            variant="outline"
            disabled={screenTimeLoading}
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${screenTimeLoading ? 'animate-spin' : ''}`} />
            {screenTimeLoading ? 'Syncing...' : 'Sync Screen Time'}
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
