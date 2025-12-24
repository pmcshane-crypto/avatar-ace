import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendingDown, Flame, Award, Calendar, Clock } from "lucide-react";
import { UserStats } from "@/types/avatar";

interface StatsCardProps {
  stats: UserStats;
}

export const StatsCard = ({ stats }: StatsCardProps) => {
  const [hoursUntilReset, setHoursUntilReset] = useState(0);

  useEffect(() => {
    const calculateHoursUntilReset = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;
      
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(0, 0, 0, 0);
      
      const msUntilReset = nextSunday.getTime() - now.getTime();
      const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
      
      setHoursUntilReset(hours);
    };

    calculateHoursUntilReset();
    const interval = setInterval(calculateHoursUntilReset, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      icon: TrendingDown,
      label: "Total Reduction",
      value: `${stats.totalReduction}%`,
      color: "text-success",
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: `${stats.currentStreak} days`,
      color: "text-warning",
    },
    {
      icon: Award,
      label: "Best Streak",
      value: `${stats.bestStreak} days`,
      color: "text-primary",
    },
    {
      icon: Calendar,
      label: "Weekly Avg",
      value: `${Math.floor(stats.weeklyAverage / 60)}h ${stats.weeklyAverage % 60}m`,
      color: "text-accent",
      subtitle: (
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
        <Card key={index} className="p-4 bg-gradient-card border-border/50">
          <div className="flex flex-col items-center text-center space-y-2">
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
            {'subtitle' in item && item.subtitle}
          </div>
        </Card>
      ))}
    </div>
  );
};
