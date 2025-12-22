import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Flame, TrendingDown, Lock, Globe, ChevronRight } from "lucide-react";

interface ClanCardProps {
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
  focus_tag: string;
  is_public: boolean;
  daily_goal_progress?: number;
  onClick?: () => void;
  onJoin?: () => void;
  isUserMember?: boolean;
}

const FOCUS_TAG_COLORS: Record<string, string> = {
  'Focus': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Social Media': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Gaming': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'All-Around': 'bg-accent/20 text-accent border-accent/30',
};

const XP_PER_LEVEL = 1000;

export function ClanCard({
  id,
  name,
  description,
  icon_emoji,
  member_count,
  max_members = 20,
  avg_reduction,
  clan_streak,
  clan_level,
  clan_xp,
  focus_tag,
  is_public,
  daily_goal_progress = 0,
  onClick,
  onJoin,
  isUserMember = false,
}: ClanCardProps) {
  const xpProgress = (clan_xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
  
  return (
    <Card 
      className={`relative overflow-hidden bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-primary/50 transition-all cursor-pointer group ${
        isUserMember ? 'ring-2 ring-primary/30' : ''
      }`}
      onClick={onClick}
    >
      {/* Glow effect for high streaks */}
      {clan_streak >= 7 && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-warning/20 rounded-full blur-3xl" />
      )}
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon and Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-3xl border border-primary/20">
                {icon_emoji}
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                {clan_level}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg truncate">{name}</h3>
                {!is_public && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                {is_public && <Globe className="w-3.5 h-3.5 text-muted-foreground/50" />}
              </div>
              
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${FOCUS_TAG_COLORS[focus_tag] || FOCUS_TAG_COLORS['All-Around']}`}
                >
                  {focus_tag}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {member_count}/{max_members}
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
              <div className="flex items-center gap-1.5 text-warning font-semibold">
                <Flame className="w-4 h-4" />
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
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Level {clan_level}</span>
              <span>{clan_xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP</span>
            </div>
            <Progress value={xpProgress} className="h-1.5" />
          </div>
        )}
        
        {/* Daily Goal Progress (for user's clans) */}
        {isUserMember && daily_goal_progress > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-success font-medium">Today's Goal</span>
              <span className="text-success">{Math.min(100, Math.round(daily_goal_progress))}%</span>
            </div>
            <Progress value={Math.min(100, daily_goal_progress)} className="h-2 bg-success/20 [&>div]:bg-success" />
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          {isUserMember ? (
            <Button 
              variant="ghost" 
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={onClick}
            >
              <span>View Clan</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onJoin?.();
              }}
            >
              Join Clan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}