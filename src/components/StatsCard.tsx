import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingDown, Flame, Award, Calendar, Clock, Pencil, Check, X } from "lucide-react";
import { UserStats } from "@/types/avatar";

interface StatsCardProps {
  stats: UserStats;
  onEditWeeklyAverage?: (newValue: number) => void;
}

export const StatsCard = ({ stats, onEditWeeklyAverage }: StatsCardProps) => {
  const [hoursUntilReset, setHoursUntilReset] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editHours, setEditHours] = useState(Math.floor(stats.weeklyAverage / 60));
  const [editMinutes, setEditMinutes] = useState(stats.weeklyAverage % 60);

  useEffect(() => {
    setEditHours(Math.floor(stats.weeklyAverage / 60));
    setEditMinutes(stats.weeklyAverage % 60);
  }, [stats.weeklyAverage]);

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

  const handleSave = () => {
    const totalMinutes = (editHours * 60) + editMinutes;
    onEditWeeklyAverage?.(totalMinutes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditHours(Math.floor(stats.weeklyAverage / 60));
    setEditMinutes(stats.weeklyAverage % 60);
    setIsEditing(false);
  };

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
      editable: true,
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
        <Card key={index} className="p-4 bg-gradient-card border-border/50 relative">
          {item.editable && onEditWeeklyAverage && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-3 h-3" />
            </Button>
          )}
          <div className="flex flex-col items-center text-center space-y-2">
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <div className="text-xs text-muted-foreground">{item.label}</div>
            {item.editable && isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    max={24}
                    value={editHours}
                    onChange={(e) => setEditHours(Math.min(24, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-12 h-7 text-center text-sm p-1"
                  />
                  <span className="text-xs">h</span>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={editMinutes}
                    onChange={(e) => setEditMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-12 h-7 text-center text-sm p-1"
                  />
                  <span className="text-xs">m</span>
                </div>
                <div className="flex justify-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave}>
                    <Check className="w-3 h-3 text-success" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
                    <X className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
            )}
            {!isEditing && 'subtitle' in item && item.subtitle}
          </div>
        </Card>
      ))}
    </div>
  );
};
