import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AvatarCard } from "@/components/AvatarCard";
import { DailyMomentCard } from "@/components/DailyMomentCard";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { XpGainPopup } from "@/components/XpGainPopup";
import { StreakFireAnimation } from "@/components/StreakFireAnimation";
import { DailyWinCelebration } from "@/components/DailyWinCelebration";
import { NotificationBell } from "@/components/NotificationBell";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarType, UserStats } from "@/types/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { checkMilestones } from "@/lib/milestones";
import { Users, RefreshCw, Smartphone, User, CheckCircle, TrendingDown, Clock, Loader2 } from "lucide-react";
import { useScreenTime } from "@/hooks/useScreenTime";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import clanButtonImg from "@/assets/clan-button-image.png";
import { useGlobalRanking } from "@/hooks/useGlobalRanking";
import { motion } from "framer-motion";

const getXpToNextLevel = (level: number): number => {
  if (level === 1) return 100;
  if (level === 2) return 300;
  if (level === 3) return 500;
  return 500;
};

const formatMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { screenTimeData, hasPermission, refreshScreenTime } = useScreenTime();
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
    baseline: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalReduction: 0,
    weeklyAverage: 0,
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
    };

    loadUserData();
  }, [navigate]);

  // Auto-sync screen time data to profile when connected
  useEffect(() => {
    if (screenTimeData.isConnected && userId && screenTimeData.baselineMinutes > 0) {
      // Update baseline in profile if it changed
      supabase
        .from('profiles')
        .update({
          baseline_minutes: screenTimeData.baselineMinutes,
          weekly_average: screenTimeData.weeklyAverage,
        })
        .eq('id', userId);

      setStats(prev => ({
        ...prev,
        baseline: screenTimeData.baselineMinutes,
        weeklyAverage: screenTimeData.weeklyAverage,
        totalReduction: screenTimeData.percentReduction,
      }));

      // Auto-save today's entry
      const today = new Date().toISOString().split('T')[0];
      supabase
        .from('screen_time_entries')
        .upsert({
          user_id: userId,
          date: today,
          total_minutes: screenTimeData.todayMinutes,
          actual_minutes: screenTimeData.todayMinutes,
          music_minutes: 0,
          better_buddy_minutes: 0,
        }, { onConflict: 'user_id,date' });
    }
  }, [screenTimeData, userId]);

  // Derive display values
  const displayBaseline = screenTimeData.isConnected ? screenTimeData.baselineMinutes : stats.baseline;
  const displayToday = screenTimeData.isConnected ? screenTimeData.todayMinutes : 0;
  const displayReduction = screenTimeData.isConnected 
    ? screenTimeData.percentReduction 
    : (displayBaseline > 0 ? Math.round(((displayBaseline - displayToday) / displayBaseline) * 100) : 0);
  const progressPercent = displayBaseline > 0 
    ? Math.max(0, Math.min(100, (displayToday / displayBaseline) * 100)) 
    : 0;

  const getBackgroundClass = () => {
    switch (avatar.type) {
      case 'fire': return 'bg-gradient-fire-bg';
      case 'water': return 'bg-gradient-water-bg';
      case 'nature': return 'bg-gradient-nature-bg';
      default: return 'bg-background';
    }
  };

  return (
    <>
      <LevelUpOverlay show={isLevelingUp} newLevel={levelUpLevel} avatarType={avatar.type} />
      <XpGainPopup show={showXpPopup} amount={xpGainAmount} />
      <StreakFireAnimation show={showStreakFire} streak={stats.currentStreak} />
      <DailyWinCelebration show={showDailyWin} reductionPercent={Math.floor(stats.totalReduction)} />

      <div className={`min-h-screen ${getBackgroundClass()} px-5 sm:px-6 py-8 transition-all duration-700`}>
        <div className="w-full max-w-4xl mx-auto space-y-10 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 relative pt-8">
            <div className="absolute right-0 top-0 flex items-center gap-1">
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Better Buddy</h1>
            <p className="text-muted-foreground">Your screen time companion</p>
          </div>

          {/* Clan Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => navigate("/clans")}
              variant="outline"
              size="lg"
              className="text-2xl px-12 py-6 h-auto"
            >
              <div className="w-16 h-16 rounded-full border-3 border-primary/50 overflow-hidden flex-shrink-0 mr-3">
                <img src={clanButtonImg} alt="Clan buddies" className="w-full h-full object-cover" />
              </div>
              <Users className="w-7 h-7 mr-2" />
              View My Clans
            </Button>
          </div>

          {/* Screen Time Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/30 space-y-5"
          >
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {screenTimeData.isConnected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-foreground">Screen Time connected via Apple Settings</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    <span className="text-sm font-medium text-muted-foreground">Syncing...</span>
                  </>
                )}
              </div>
              {hasPermission && (
                <Button variant="ghost" size="icon" onClick={refreshScreenTime} className="rounded-full h-8 w-8">
                  <RefreshCw className={`w-4 h-4 ${screenTimeData.isSyncing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>

            {/* Baseline */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your baseline</span>
              <span className="text-lg font-bold text-foreground">
                {screenTimeData.isConnected || displayBaseline > 0
                  ? formatMinutes(displayBaseline)
                  : 'Syncing...'}
              </span>
            </div>

            {/* Today */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Today</span>
              <span className="text-lg font-bold text-foreground">
                {screenTimeData.isConnected
                  ? formatMinutes(displayToday)
                  : 'Syncing...'}
              </span>
            </div>

            {/* Progress bar: today vs baseline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Today vs Baseline</span>
                <span className={`font-bold ${displayReduction > 0 ? 'text-green-500' : displayReduction < 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {screenTimeData.isConnected
                    ? `${displayReduction > 0 ? '+' : ''}${displayReduction}% reduction`
                    : 'Syncing...'}
                </span>
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className={`h-full rounded-full ${
                    progressPercent <= 80 ? 'bg-green-500' : progressPercent <= 100 ? 'bg-amber-500' : 'bg-destructive'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{formatMinutes(displayBaseline)} (baseline)</span>
              </div>
            </div>
          </motion.div>

          {/* Daily Moment */}
          <DailyMomentCard 
            reduction={stats.totalReduction}
            hasClans={false}
          />

          {/* Avatar Display */}
          <div className={`bg-black rounded-3xl p-10 sm:p-8 transition-all duration-500 ${
            isLevelingUp 
              ? 'shadow-[0_0_60px_hsl(var(--primary)/0.8),0_0_100px_hsl(var(--accent)/0.6)] scale-105' 
              : 'shadow-glow'
          }`}>
            <AvatarCard avatar={avatar} size="lg" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border/30 text-center space-y-1">
              <p className="text-sm text-muted-foreground">🔥 Streak</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.currentStreak > 0 ? `${stats.currentStreak}d` : 'Day 1'}
              </p>
              <p className="text-xs text-muted-foreground">Best: {stats.bestStreak}d</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border/30 text-center space-y-1">
              <p className="text-sm text-muted-foreground">📊 Weekly Avg</p>
              <p className="text-3xl font-bold text-foreground">
                {screenTimeData.isConnected || stats.weeklyAverage > 0
                  ? formatMinutes(stats.weeklyAverage)
                  : 'Syncing...'}
              </p>
            </div>
          </div>

          {/* Global Ranking */}
          {!rankLoading && userRank > 0 && (
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border/30 text-center space-y-2">
              <p className="text-sm text-muted-foreground font-medium">🌍 Global Ranking</p>
              <p className="text-4xl font-bold text-primary">#{userRank.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">out of {totalUsers.toLocaleString()} active users</p>
              <p className="text-xs text-accent font-medium">Top {Math.ceil((userRank / totalUsers) * 100)}% worldwide</p>
            </div>
          )}

          {/* Change Buddy */}
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
