import { Card } from "@/components/ui/card";
import { TrendingDown, Flame, Award, Calendar } from "lucide-react";
import { UserStats } from "@/types/avatar";

interface StatsCardProps {
  stats: UserStats;
}

export const StatsCard = ({ stats }: StatsCardProps) => {
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
          </div>
        </Card>
      ))}
    </div>
  );
};
