import { motion } from "framer-motion";
import { Flame, Users, Trophy, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FeaturedClanCardProps {
  id: string;
  name: string;
  description?: string;
  icon_emoji: string;
  member_count: number;
  max_members?: number;
  avg_reduction: number;
  clan_streak: number;
  clan_level: number;
  clan_xp: number;
  badge?: 'top-performer' | 'highest-streak' | 'trending';
  onJoin: () => void;
}

const badgeConfig = {
  'top-performer': { label: '🏆 Top Performer', color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/50' },
  'highest-streak': { label: '🔥 Highest Streak', color: 'from-orange-500/20 to-red-500/20 border-orange-500/50' },
  'trending': { label: '📈 Trending', color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/50' },
};

export function FeaturedClanCard({
  name,
  description,
  icon_emoji,
  member_count,
  max_members = 20,
  avg_reduction,
  clan_streak,
  clan_level,
  clan_xp,
  badge,
  onJoin,
}: FeaturedClanCardProps) {
  const xpForNextLevel = clan_level * 500;
  const xpProgress = (clan_xp / xpForNextLevel) * 100;
  const badgeInfo = badge ? badgeConfig[badge] : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative min-w-[280px] md:min-w-[320px] p-5 rounded-2xl border-2 backdrop-blur-sm",
        "bg-gradient-to-br from-card/80 to-card/40",
        "transition-all duration-300 cursor-pointer group",
        badgeInfo ? badgeInfo.color : "border-primary/30 from-primary/10 to-accent/10"
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
      
      {/* Badge */}
      {badgeInfo && (
        <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-background border text-xs font-semibold">
          {badgeInfo.label}
        </div>
      )}

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-110 transition-transform">
              {icon_emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  LVL {clan_level}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mt-1">{name}</h3>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}

        {/* XP Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Clan XP</span>
            <span className="font-medium">{clan_xp}/{xpForNextLevel}</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-lg bg-background/50">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold">{member_count}/{max_members}</span>
            <span className="text-[10px] text-muted-foreground">Members</span>
          </div>
          
          <div className="flex flex-col items-center p-2 rounded-lg bg-warning/10">
            <div className="flex items-center gap-1 text-warning">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-warning">{clan_streak}</span>
            <span className="text-[10px] text-muted-foreground">Streak</span>
          </div>
          
          <div className="flex flex-col items-center p-2 rounded-lg bg-success/10">
            <div className="flex items-center gap-1 text-success">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-success">{avg_reduction}%</span>
            <span className="text-[10px] text-muted-foreground">Reduced</span>
          </div>
        </div>

        {/* Join Button */}
        <Button 
          onClick={(e) => { e.stopPropagation(); onJoin(); }}
          className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          Join Clan
        </Button>
      </div>
    </motion.div>
  );
}
