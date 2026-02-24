import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AvatarCard } from "@/components/AvatarCard";
import { ScreenTimeInput } from "@/components/ScreenTimeInput";
import { StatsCard } from "@/components/StatsCard";
import { DailyMomentCard } from "@/components/DailyMomentCard";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { XpGainPopup } from "@/components/XpGainPopup";
import { StreakFireAnimation } from "@/components/StreakFireAnimation";
import { DailyWinCelebration } from "@/components/DailyWinCelebration";
import { NotificationBell } from "@/components/NotificationBell";
import { Avatar, AvatarType, UserStats } from "@/types/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { checkMilestones } from "@/lib/milestones";
import { Users, RefreshCw, Smartphone, User } from "lucide-react";
import { useScreenTime } from "@/hooks/useScreenTime";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import clanBuddiesImg from "@/assets/clan-buddies.png";
import { useGlobalRanking } from "@/hooks/useGlobalRanking";

const getXpToNextLevel = (level: number): number => {
  if (level === 1) return 100;
  if (level === 2) return 300;
  if (level === 3) return 500;
  return 500; // cap at 500 for level 4+
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { screenTimeData, hasPermission, isLoading, refreshScreenTime } = useScreenTime();
  const [userId, setUserId] = useState<string | null>(null);
  const { userRank, totalUsers, reductionPercent, isLoading: rankLoading } = useGlobalRanking(userId);
  const { notifications, unreadCount, markAsRead, markAllAsRead, sendNotification } = useNotifications(userId);
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
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);
  const [showStreakFire, setShowStreakFire] = useState(false);
  const [showDailyWin, setShowDailyWin] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);

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
          xpToNextLevel: getXpToNextLevel(profile.avatar_level),
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

    // Calculate XP using nonlinear discipline-based curve (v2 — allows negative delta)
    const cap = 600; // 10h normalization cap
    const clampedBaseline = Math.max(30, stats.baseline);
    const clampedToday = Math.max(0, actualMinutes);

    const percentChange = (clampedBaseline - clampedToday) / clampedBaseline;
    const absoluteChange = clampedBaseline - clampedToday;
    const disciplineFactor = Math.max(0, Math.min(1, 1 - (clampedToday / cap)));

    const score =
      (percentChange * 0.55) +
      ((absoluteChange / cap) * 0.35) +
      (disciplineFactor * 0.10);

    let xpChange = Math.round(score * 120);
    xpChange = Math.max(-60, Math.min(100, xpChange));

    // Apply delta — allow negative so level-down logic can fire
    let newXp = avatar.xp + xpChange;
    let newLevel = avatar.level;

    // Handle level up with full overlay
    if (newXp >= avatar.xpToNextLevel) {
      newLevel += 1;
      newXp = newXp - avatar.xpToNextLevel;
      setLevelUpLevel(newLevel);
      setIsLevelingUp(true);
      setTimeout(() => setIsLevelingUp(false), 2000);
    }

    // Handle level down
    while (newXp < 0 && newLevel > 1) {
      newLevel -= 1;
      newXp = getXpToNextLevel(newLevel) + newXp;
    }
    if (newXp < 0) newXp = 0;

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
      xpToNextLevel: getXpToNextLevel(newLevel),
    });

    const newStreak = reduction > 0 ? stats.currentStreak + 1 : 0;
    setStats({
      ...stats,
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      totalReduction: Math.floor(reduction),
    });

    // Check milestones and send notifications
    const milestones = checkMilestones({
      newStreak,
      previousStreak: stats.currentStreak,
      newLevel,
      previousLevel: avatar.level,
      userRank,
      totalUsers,
      reductionPercent: Math.floor(reduction),
      avatarName: avatar.name || "Your Buddy",
    });

    for (const m of milestones) {
      sendNotification({
        type: m.type,
        title: m.title,
        message: m.message,
        icon: m.icon,
      });
    }

    // Trigger celebration animations
    if (xpChange > 0) {
      // XP gain popup
      setXpGainAmount(xpChange);
      setShowXpPopup(true);
      setTimeout(() => setShowXpPopup(false), 1800);

      // Daily win celebration
      if (reduction > 10) {
        setTimeout(() => {
          setShowDailyWin(true);
          setTimeout(() => setShowDailyWin(false), 4000);
        }, 500);
      }

      // Streak fire
      if (newStreak > 1) {
        setTimeout(() => {
          setShowStreakFire(true);
          setTimeout(() => setShowStreakFire(false), 3500);
        }, reduction > 10 ? 4500 : 1000);
      }

      toast({
        title: "Great job! 🎉",
        description: `You reduced screen time by ${Math.floor(reduction)}%! Your avatar gained ${xpChange} XP!`,
      });
    } else if (xpChange < 0) {
      setXpGainAmount(xpChange);
      setShowXpPopup(true);
      setTimeout(() => setShowXpPopup(false), 1800);

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
    <>
      {/* Celebration Overlays */}
      <LevelUpOverlay show={isLevelingUp} newLevel={levelUpLevel} avatarType={avatar.type} />
      <XpGainPopup show={showXpPopup} amount={xpGainAmount} />
      <StreakFireAnimation show={showStreakFire} streak={stats.currentStreak} />
      <DailyWinCelebration show={showDailyWin} reductionPercent={Math.floor(stats.totalReduction)} />

    <div className={`min-h-screen ${getBackgroundClass()} p-6 transition-all duration-700`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 relative">
          <div className="absolute right-0 top-0 flex items-center gap-1">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
            <Button
              variant="ghost"
              className="h-14 w-14 p-0"
              onClick={() => navigate("/profile")}
            >
              <User className="w-10 h-10" />
            </Button>
          </div>
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
            className="text-2xl px-12 py-6 h-auto"
          >
            <img src={clanBuddiesImg} alt="Clan buddies" className="w-12 h-12 rounded-full object-cover mr-3" />
            <Users className="w-7 h-7 mr-2" />
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

        {/* Global Ranking */}
        {!rankLoading && userRank > 0 && (
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border/30 text-center space-y-2">
            <p className="text-sm text-muted-foreground font-medium">🌍 Global Ranking</p>
            <p className="text-4xl font-bold text-primary">
              #{userRank.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              out of {totalUsers.toLocaleString()} users today
            </p>
            <p className="text-xs text-accent font-medium">
              Top {Math.ceil((userRank / totalUsers) * 100)}% worldwide
            </p>
          </div>
        )}

        {/* Screen Time Input - Only show if not automatic */}
        {!screenTimeData.isAutomatic && (
          <ScreenTimeInput onSubmit={handleScreenTimeSubmit} baseline={stats.baseline} avatarType={avatar.type} />
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
    </>
  );
};

export default Dashboard;
