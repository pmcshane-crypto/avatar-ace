import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Flame, TrendingDown, Lock, Globe, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClanCardProps {
  id: string;
  name: string;
  description?: string;
  icon_emoji: string;
  member_count: number;
  avg_reduction: number;
  clan_streak: number;
  clan_level: number;
  clan_xp: number;
  is_public: boolean;
  daily_goal_progress?: number;
  focus_tag?: string;
  onClick?: () => void;
  onJoin?: () => void;
  isUserMember?: boolean;
  isActive?: boolean;
}

const XP_PER_LEVEL = 1000;

export function ClanCard({
  id,
  name,
  description,
  icon_emoji,
  member_count,
  avg_reduction,
  clan_streak,
  clan_level,
  clan_xp,
  is_public,
  daily_goal_progress = 0,
  focus_tag,
  onClick,
  onJoin,
  isUserMember = false,
  isActive = false,
}: ClanCardProps) {
  const xpProgress = (clan_xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
  const isHotStreak = clan_streak >= 7;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-300 cursor-pointer group",
          "bg-gradient-to-br from-card to-card/80 border-border/50",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
          isUserMember && "ring-2 ring-primary/30",
          isHotStreak && "border-warning/50 hover:border-warning/70",
          isActive && "ring-2 ring-success/50"
        )}
        onClick={onClick}
      >
        {/* Glow effect for high streaks */}
        {isHotStreak && (
          <>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-warning/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-warning/50 via-warning to-warning/50" />
          </>
        )}
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-3 right-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
          </div>
        )}
        
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Icon and Info */}
            <div className="flex items-start gap-4 flex-1">
              <motion.div 
                className="relative"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center text-3xl border transition-all duration-300",
                  "bg-gradient-to-br from-primary/30 to-accent/20 border-primary/20",
                  "group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20"
                )}>
                  {icon_emoji}
                </div>
                {/* Level badge */}
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  "bg-primary text-primary-foreground shadow-lg"
                )}>
                  {clan_level}
                </div>
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{name}</h3>
                  {!is_public && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                  {is_public && <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />}
                  {focus_tag && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {focus_tag}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {member_count} members
                  </span>
                </div>
                
                {description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Right: Stats */}
            <div className="flex flex-col items-end gap-2 text-right shrink-0">
              {clan_streak > 0 && (
                <div className={cn(
                  "flex items-center gap-1.5 font-semibold",
                  isHotStreak ? "text-warning" : "text-muted-foreground"
                )}>
                  <Flame className={cn("w-4 h-4", isHotStreak && "animate-pulse")} />
                  <span>{clan_streak} days</span>
                </div>
              )}
              
              <div className="flex items-center gap-1.5 text-success text-sm">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{avg_reduction > 0 ? `${avg_reduction.toFixed(0)}%` : 'New'}</span>
              </div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          {isUserMember && (
            <motion.div 
              className="mt-4 space-y-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Level {clan_level}</span>
                <span>{clan_xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP</span>
              </div>
              <Progress value={xpProgress} className="h-1.5" />
            </motion.div>
          )}
          
          {/* Daily Goal Progress (for user's clans) */}
          {isUserMember && daily_goal_progress > 0 && (
            <motion.div 
              className="mt-3 p-3 rounded-lg bg-success/10 border border-success/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-success font-medium">Today's Goal</span>
                <span className="text-success">{Math.min(100, Math.round(daily_goal_progress))}%</span>
              </div>
              <Progress value={Math.min(100, daily_goal_progress)} className="h-2 bg-success/20 [&>div]:bg-success" />
            </motion.div>
          )}
          
          {/* Actions */}
          <div className="mt-4 flex items-center justify-between">
            {isUserMember ? (
              <Button 
                variant="ghost" 
                className="w-full justify-between text-muted-foreground hover:text-foreground group/btn"
                onClick={onClick}
              >
                <span>View Clan</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            ) : (
              <Button 
                className="w-full gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin?.();
                }}
              >
                <Sparkles className="w-4 h-4" />
                Join Clan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}