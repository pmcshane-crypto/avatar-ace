import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Medal, Award } from "lucide-react";

// Import all avatar images
import avatarFire from "@/assets/avatar-fire.png";
import avatarFireLevel2 from "@/assets/avatar-fire-level2.png";
import avatarFireLevel3 from "@/assets/avatar-fire-level3.png";
import avatarWater from "@/assets/avatar-water.png";
import avatarWaterLevel2 from "@/assets/avatar-water-level2.png";
import avatarWaterLevel3 from "@/assets/avatar-water-level3.png";
import avatarNature from "@/assets/avatar-nature.png";
import avatarNatureLevel2 from "@/assets/avatar-nature-level2.png";
import avatarNatureLevel3 from "@/assets/avatar-nature-level3.png";
import avatarChungloid from "@/assets/avatar-chungloid.png";
import avatarChungloidLevel2 from "@/assets/avatar-chungloid-level2.png";
import avatarChungloidLevel3 from "@/assets/avatar-chungloid-level3.png";
import avatarChickenNugget from "@/assets/avatar-chicken-nugget.png";
import avatarChickenNuggetLevel2 from "@/assets/avatar-chicken-nugget-level2.png";
import avatarChickenNuggetLevel3 from "@/assets/avatar-chicken-nugget-level3.png";

interface ClanMemberRowProps {
  rank: number;
  user_id: string;
  username: string;
  avatar_type: string;
  avatar_level?: number;
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

// Avatar image mapping by type and level
const AVATAR_IMAGES: Record<string, Record<number, string>> = {
  fire: {
    1: avatarFire,
    2: avatarFireLevel2,
    3: avatarFireLevel3,
  },
  water: {
    1: avatarWater,
    2: avatarWaterLevel2,
    3: avatarWaterLevel3,
  },
  nature: {
    1: avatarNature,
    2: avatarNatureLevel2,
    3: avatarNatureLevel3,
  },
  chungloid: {
    1: avatarChungloid,
    2: avatarChungloidLevel2,
    3: avatarChungloidLevel3,
  },
  'chicken-nugget': {
    1: avatarChickenNugget,
    2: avatarChickenNuggetLevel2,
    3: avatarChickenNuggetLevel3,
  },
};

const getAvatarImage = (type: string, level: number = 1): string => {
  const normalizedType = type.toLowerCase();
  const avatarSet = AVATAR_IMAGES[normalizedType];
  if (!avatarSet) return avatarFire; // Default fallback
  
  // Clamp level between 1 and 3
  const clampedLevel = Math.max(1, Math.min(3, level));
  return avatarSet[clampedLevel] || avatarSet[1];
};

export function ClanMemberRow({
  rank,
  username,
  avatar_type,
  avatar_level = 1,
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
  
  const avatarImage = getAvatarImage(avatar_type, avatar_level);

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
          <div className="relative">
            <img 
              src={avatarImage} 
              alt={`${avatar_type} avatar`}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 bg-card"
            />
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground border border-background">
              {avatar_level}
            </div>
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              {username}
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs py-0">You</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground capitalize flex items-center gap-2">
              <span className="text-primary font-medium">Lv.{avatar_level}</span>
              <span>{avatar_type.replace('-', ' ')}</span>
              {isActiveToday && (
                <span className="flex items-center gap-1 text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Active
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