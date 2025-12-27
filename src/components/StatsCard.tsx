import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TrendingDown, Flame, Award, Calendar, Clock, Lock, Sparkles } from "lucide-react";
import { UserStats } from "@/types/avatar";

interface StatsCardProps {
  stats: UserStats;
}

// Progress framing - make early users feel like they're onboarding, not failing
const getProgressMessage = (value: number, type: 'streak' | 'reduction' | 'best') => {
  if (value === 0) {
    switch (type) {
      case 'streak':
        return { display: "Day 1", subtitle: "Your journey begins", showProgress: true };
      case 'reduction':
        return { display: "0%", subtitle: "Just getting started", showProgress: true };
      case 'best':
        return { display: "—", subtitle: "Build your first streak", showProgress: true };
    }
  }
  return null;
};

export const StatsCard = ({ stats }: StatsCardProps) => {
  const [hoursUntilReset, setHoursUntilReset] = useState(0);

  useEffect(() => {
    const calculateHoursUntilReset = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;
      
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(0, 0, 0, 0);
      
      const msUntilReset = nextSunday.getTime() - now.getTime();
      const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
      
      setHoursUntilReset(hours);
    };

    calculateHoursUntilReset();
    const interval = setInterval(calculateHoursUntilReset, 60000);

    return () => clearInterval(interval);
  }, []);

  const streakProgress = getProgressMessage(stats.currentStreak, 'streak');
  const reductionProgress = getProgressMessage(stats.totalReduction, 'reduction');
  const bestProgress = getProgressMessage(stats.bestStreak, 'best');

  const statItems = [
    {
      icon: TrendingDown,
      label: "Total Reduction",
      value: reductionProgress?.display ?? `${stats.totalReduction}%`,
      subtitle: reductionProgress?.subtitle,
      color: stats.totalReduction > 0 ? "text-success" : "text-muted-foreground",
      showLocked: reductionProgress?.showProgress,
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: streakProgress?.display ?? `${stats.currentStreak} days`,
      subtitle: streakProgress?.subtitle,
      color: stats.currentStreak > 0 ? "text-warning" : "text-muted-foreground",
      showLocked: false, // Show "Day 1" styling differently
    },
    {
      icon: Award,
      label: "Best Streak",
      value: bestProgress?.display ?? `${stats.bestStreak} days`,
      subtitle: bestProgress?.subtitle,
      color: stats.bestStreak > 0 ? "text-primary" : "text-muted-foreground",
      showLocked: bestProgress?.showProgress,
    },
    {
      icon: Calendar,
      label: "Weekly Avg",
      value: `${Math.floor(stats.weeklyAverage / 60)}h ${stats.weeklyAverage % 60}m`,
      color: "text-accent",
      showSubtitle: (
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/60 mt-1">
          <Clock className="w-3 h-3" />
          <span>{hoursUntilReset}h until reset</span>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {statItems.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`p-4 bg-gradient-card border-border/50 relative overflow-hidden ${
            item.showLocked ? 'opacity-80' : ''
          }`}>
            {/* Subtle shimmer for "locked" states */}
            {item.showLocked && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/10 to-transparent animate-shimmer" />
            )}
            
            <div className="relative flex flex-col items-center text-center space-y-2">
              <div className="relative">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                {item.showLocked && (
                  <Sparkles className="w-3 h-3 text-accent absolute -top-1 -right-2 animate-pulse" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
              {item.subtitle && (
                <div className="text-[10px] text-muted-foreground/60">{item.subtitle}</div>
              )}
              {'showSubtitle' in item && item.showSubtitle}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
