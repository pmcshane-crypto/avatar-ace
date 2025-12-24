import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Medal, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

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
  avatar_xp?: number;
  avatar_energy?: 'high' | 'medium' | 'low';
  daily_reduction: number;
  weekly_avg: number;
  current_streak: number;
  today_minutes?: number;
  contribution: number;
  last_active?: string;
  isCurrentUser?: boolean;
  showDetails?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  highlightPulse?: boolean;
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

const getEnergyIndicator = (energy: string) => {
  switch (energy) {
    case 'high': return { color: 'text-success', bg: 'bg-success/20', pulse: true };
    case 'low': return { color: 'text-destructive', bg: 'bg-destructive/20', pulse: false };
    default: return { color: 'text-warning', bg: 'bg-warning/20', pulse: false };
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
  user_id,
  username,
  avatar_type,
  avatar_level = 1,
  avatar_xp = 0,
  avatar_energy = 'medium',
  daily_reduction,
  weekly_avg,
  current_streak,
  today_minutes,
  contribution,
  last_active,
  isCurrentUser = false,
  showDetails = false,
  isLoading = false,
  onClick,
  highlightPulse = false,
}: ClanMemberRowProps) {
  const RankIcon = rank <= 3 ? RANK_ICONS[rank - 1]?.icon : null;
  const rankColor = rank <= 3 ? RANK_ICONS[rank - 1]?.color : "text-muted-foreground";
  const isActiveToday = last_active && new Date(last_active).toDateString() === new Date().toDateString();
  const avatarImage = getAvatarImage(avatar_type, avatar_level);
  const energyStyle = getEnergyIndicator(avatar_energy);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-card/60 border border-border/50">
        <div className="flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <Skeleton className="w-16 h-8" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: highlightPulse ? [1, 1.02, 1] : 1,
      }}
      transition={{ 
        duration: 0.3,
        scale: { repeat: highlightPulse ? 2 : 0, duration: 0.3 }
      }}
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isCurrentUser 
          ? 'bg-gradient-to-r from-primary/20 to-primary/5 border-2 border-primary/40 shadow-lg shadow-primary/10' 
          : 'bg-card/60 hover:bg-card border border-border/50'
      } ${highlightPulse ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
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
            <motion.div 
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute inset-0 rounded-full blur-md ${getGlowColor(avatar_type)}`} 
            />
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
            {/* Energy indicator */}
            <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center ${energyStyle.bg}`}>
              <Zap className={`w-3 h-3 ${energyStyle.color} ${energyStyle.pulse ? 'animate-pulse' : ''}`} />
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
          <motion.div 
            key={daily_reduction}
            initial={{ scale: 1.2, color: 'hsl(var(--success))' }}
            animate={{ scale: 1 }}
            className={`text-xl font-bold ${daily_reduction > 0 ? 'text-success' : 'text-muted-foreground'}`}
          >
            {daily_reduction > 0 ? `${daily_reduction}%` : '--'}
          </motion.div>
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
              <motion.div 
                key={contribution}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="font-semibold text-lg text-primary"
              >
                +{contribution}
              </motion.div>
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
    </motion.div>
  );
}

// Loading skeleton component
export function ClanMemberRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-card/60 border border-border/50 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-8" />
        <Skeleton className="w-8 h-6" />
      </div>
    </div>
  );
}