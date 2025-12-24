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
import avatarFlarion from "@/assets/avatar-flarion.png";
import avatarFlarionLevel2 from "@/assets/avatar-flarion-level2.png";
import avatarFlarionLevel3 from "@/assets/avatar-flarion-level3.png";
import avatarAuarlis from "@/assets/avatar-auarlis.png";
import avatarAuarlisLevel2 from "@/assets/avatar-auarlis-level2.png";
import avatarAuarlisLevel3 from "@/assets/avatar-auarlis-level3.png";
import avatarTeddy from "@/assets/avatar-teddy.png";
import avatarTeddyLevel2 from "@/assets/avatar-teddy-level2.png";
import avatarTeddyLevel3 from "@/assets/avatar-teddy-level3.png";

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
  flarion: {
    1: avatarFlarion,
    2: avatarFlarionLevel2,
    3: avatarFlarionLevel3,
  },
  auarlis: {
    1: avatarAuarlis,
    2: avatarAuarlisLevel2,
    3: avatarAuarlisLevel3,
  },
  teddy: {
    1: avatarTeddy,
    2: avatarTeddyLevel2,
    3: avatarTeddyLevel3,
  },
};

// Get glow color based on avatar type
const getGlowColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'fire': return 'bg-orange-500/50';
    case 'water': return 'bg-blue-500/50';
    case 'nature': return 'bg-green-500/50';
    case 'chungloid': return 'bg-purple-500/50';
    case 'chicken-nugget': return 'bg-amber-500/50';
    case 'flarion': return 'bg-violet-500/50';
    case 'auarlis': return 'bg-sky-400/50';
    case 'teddy': return 'bg-yellow-500/50';
    default: return 'bg-primary/30';
  }
};

const getAvatarImage = (type: string, level: number = 1): string => {
  const normalizedType = type.toLowerCase();
  const avatarSet = AVATAR_IMAGES[normalizedType];
  if (!avatarSet) return avatarNature; // Default fallback
  
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
      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary/40 shadow-lg shadow-primary/10' 
          : 'bg-card/60 hover:bg-card border border-border/50'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`w-8 text-center font-bold text-lg ${rankColor}`}>
          {RankIcon ? (
            <RankIcon className="w-6 h-6 mx-auto" />
          ) : (
            <span>{rank}</span>
          )}
        </div>

        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            {/* Glow effect behind avatar - matches avatar type color */}
            <div className={`absolute inset-0 rounded-full blur-md opacity-70 ${getGlowColor(avatar_type)}`} />
            <div className="relative w-14 h-14 rounded-full bg-black border-2 border-primary/50 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
              <img 
                src={avatarImage} 
                alt={`${avatar_type} avatar`}
                className="w-full h-full object-contain scale-90"
              />
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-background shadow-md">
              {avatar_level}
            </div>
          </div>
          <div>
            <div className="font-semibold text-lg flex items-center gap-2">
              {username}
              {isCurrentUser && (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">You</Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground capitalize flex items-center gap-2">
              <span className="text-primary font-semibold">Lv.{avatar_level}</span>
              <span className="text-foreground/70">{avatar_type.replace('-', ' ')}</span>
              {isActiveToday && (
                <span className="flex items-center gap-1.5 text-success text-xs">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Today's Reduction */}
        <div className="text-right">
          <div className={`text-xl font-bold ${daily_reduction > 0 ? 'text-success' : 'text-muted-foreground'}`}>
            {daily_reduction > 0 ? `${daily_reduction}%` : '--'}
          </div>
          <div className="text-xs text-muted-foreground">today</div>
        </div>

        {showDetails && (
          <>
            {/* Weekly Average */}
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-lg">
                {Math.floor(weekly_avg / 60)}h {weekly_avg % 60}m
              </div>
              <div className="text-xs text-muted-foreground">weekly avg</div>
            </div>

            {/* Contribution */}
            <div className="text-right hidden md:block">
              <div className="font-semibold text-lg text-primary">
                +{contribution}
              </div>
              <div className="text-xs text-muted-foreground">XP earned</div>
            </div>
          </>
        )}

        {/* Streak */}
        {current_streak > 0 && (
          <div className="flex items-center gap-1.5 text-warning font-bold text-lg">
            <Flame className="w-5 h-5" />
            <span>{current_streak}</span>
          </div>
        )}
      </div>
    </div>
  );
}