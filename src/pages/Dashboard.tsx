import { useState, useEffect } from "react";
import { AvatarCard } from "@/components/AvatarCard";
import { ScreenTimeInput } from "@/components/ScreenTimeInput";
import { StatsCard } from "@/components/StatsCard";
import { Avatar, AvatarType, UserStats } from "@/types/avatar";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
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
    weeklyAverage: parseInt(localStorage.getItem('baseline') || '300'),
  });

  const handleScreenTimeSubmit = (data: {
    totalMinutes: number;
    musicMinutes: number;
    betterBuddyMinutes: number;
  }) => {
    const actualMinutes = data.totalMinutes - data.musicMinutes - data.betterBuddyMinutes;
    const reduction = ((stats.baseline - actualMinutes) / stats.baseline) * 100;

    // Update avatar energy based on reduction
    let newEnergy: 'high' | 'medium' | 'low' = 'medium';
    if (reduction > 20) newEnergy = 'high';
    else if (reduction < 0) newEnergy = 'low';

    // Calculate XP gain
    const xpGain = Math.max(0, Math.floor(reduction * 2));
    const newXp = avatar.xp + xpGain;
    let newLevel = avatar.level;
    let remainingXp = newXp;

    // Level up check
    if (newXp >= avatar.xpToNextLevel) {
      newLevel += 1;
      remainingXp = newXp - avatar.xpToNextLevel;
    }

    setAvatar({
      ...avatar,
      energy: newEnergy,
      xp: remainingXp,
      level: newLevel,
      xpToNextLevel: newLevel * 100,
    });

    // Update stats
    const newStreak = reduction > 0 ? stats.currentStreak + 1 : 0;
    setStats({
      ...stats,
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      totalReduction: Math.max(0, Math.floor(reduction)),
    });

    toast({
      title: reduction > 0 ? "Great job! 🎉" : "Keep trying! 💪",
      description: reduction > 0 
        ? `You reduced screen time by ${Math.floor(reduction)}%! Your avatar gained ${xpGain} XP!`
        : "Your avatar needs your help. Try to reduce screen time tomorrow!",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Better Buddy</h1>
          <p className="text-muted-foreground">Your screen time companion</p>
        </div>

        {/* Avatar Display */}
        <div className="bg-gradient-primary rounded-3xl p-8 shadow-glow">
          <AvatarCard avatar={avatar} size="lg" />
        </div>

        {/* Stats Grid */}
        <StatsCard stats={stats} />

        {/* Screen Time Input */}
        <ScreenTimeInput onSubmit={handleScreenTimeSubmit} />
      </div>
    </div>
  );
};

export default Dashboard;
