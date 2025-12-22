import { Badge } from "@/components/ui/badge";
import { Flame, Clock, Trophy, Medal, Award } from "lucide-react";

interface ClanMemberRowProps {
  rank: number;
  user_id: string;
  username: string;
  avatar_type: string;
  daily_reduction: number;
  weekly_avg: number;
  current_streak: number;
  today_minutes?: number;
  contribution: number;
  last_active?: string;
  isCurrentUser?: boolean;
  showDetails?: boolean;
}

const RANK_ICONS = [
  { icon: Trophy, color: "text-warning" },
  { icon: Medal, color: "text-gray-400" },
  { icon: Award, color: "text-amber-600" },
];

export function ClanMemberRow({
  rank,
  username,
  avatar_type,
  daily_reduction,
  weekly_avg,
  current_streak,
  today_minutes,
  contribution,
  last_active,
  isCurrentUser = false,
  showDetails = false,
}: ClanMemberRowProps) {
  const RankIcon = rank <= 3 ? RANK_ICONS[rank - 1]?.icon : null;
  const rankColor = rank <= 3 ? RANK_ICONS[rank - 1]?.color : "text-muted-foreground";

  const isActiveToday = last_active && new Date(last_active).toDateString() === new Date().toDateString();

  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        isCurrentUser 
          ? 'bg-primary/10 border border-primary/30' 
          : 'bg-card/50 hover:bg-card'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className={`w-8 text-center font-bold ${rankColor}`}>
          {RankIcon ? (
            <RankIcon className="w-5 h-5 mx-auto" />
          ) : (
            <span>{rank}</span>
          )}
        </div>

        {/* Avatar & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold uppercase">
            {username[0]}
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              {username}
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs py-0">You</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground capitalize flex items-center gap-2">
              {avatar_type}
              {isActiveToday && (
                <span className="flex items-center gap-1 text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Active today
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Today's Reduction */}
        <div className="text-right">
          <div className={`font-bold ${daily_reduction > 0 ? 'text-success' : 'text-muted-foreground'}`}>
            {daily_reduction > 0 ? `${daily_reduction}%` : '--'}
          </div>
          <div className="text-xs text-muted-foreground">today</div>
        </div>

        {showDetails && (
          <>
            {/* Weekly Average */}
            <div className="text-right hidden sm:block">
              <div className="font-medium">
                {Math.floor(weekly_avg / 60)}h {weekly_avg % 60}m
              </div>
              <div className="text-xs text-muted-foreground">weekly avg</div>
            </div>

            {/* Contribution */}
            <div className="text-right hidden md:block">
              <div className="font-medium text-primary">
                +{contribution}
              </div>
              <div className="text-xs text-muted-foreground">XP earned</div>
            </div>
          </>
        )}

        {/* Streak */}
        {current_streak > 0 && (
          <div className="flex items-center gap-1 text-warning font-semibold">
            <Flame className="w-4 h-4" />
            <span>{current_streak}</span>
          </div>
        )}
      </div>
    </div>
  );
}