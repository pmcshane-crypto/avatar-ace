import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, TrendingDown, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";

// Import avatar images
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

interface MemberProfile {
  user_id: string;
  username: string;
  avatar_type: string;
  avatar_level: number;
  avatar_xp?: number;
  avatar_energy?: 'high' | 'medium' | 'low';
  current_streak: number;
  best_streak?: number;
  daily_reduction: number;
  weekly_avg: number;
  total_reduction?: number;
}

interface MemberProfilePreviewProps {
  member: MemberProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_IMAGES: Record<string, Record<number, string>> = {
  fire: { 1: avatarFire, 2: avatarFireLevel2, 3: avatarFireLevel3 },
  water: { 1: avatarWater, 2: avatarWaterLevel2, 3: avatarWaterLevel3 },
  nature: { 1: avatarNature, 2: avatarNatureLevel2, 3: avatarNatureLevel3 },
  chungloid: { 1: avatarChungloid, 2: avatarChungloidLevel2, 3: avatarChungloidLevel3 },
  'chicken-nugget': { 1: avatarChickenNugget, 2: avatarChickenNuggetLevel2, 3: avatarChickenNuggetLevel3 },
  flarion: { 1: avatarFlarion, 2: avatarFlarionLevel2, 3: avatarFlarionLevel3 },
  auarlis: { 1: avatarAuarlis, 2: avatarAuarlisLevel2, 3: avatarAuarlisLevel3 },
  teddy: { 1: avatarTeddy, 2: avatarTeddyLevel2, 3: avatarTeddyLevel3 },
};

const getGlowColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'fire': return 'shadow-orange-500/50';
    case 'water': return 'shadow-blue-500/50';
    case 'nature': return 'shadow-green-500/50';
    case 'chungloid': return 'shadow-purple-500/50';
    case 'chicken-nugget': return 'shadow-amber-500/50';
    case 'flarion': return 'shadow-violet-500/50';
    case 'auarlis': return 'shadow-sky-400/50';
    case 'teddy': return 'shadow-yellow-500/50';
    default: return 'shadow-primary/30';
  }
};

const getXpToNextLevel = (level: number): number => {
  if (level >= 3) return 600;
  return level === 1 ? 200 : level === 2 ? 400 : 600;
};

const getEnergyColor = (energy: string) => {
  switch (energy) {
    case 'high': return 'text-success bg-success/20';
    case 'low': return 'text-destructive bg-destructive/20';
    default: return 'text-warning bg-warning/20';
  }
};

export function MemberProfilePreview({ member, isOpen, onClose }: MemberProfilePreviewProps) {
  if (!member) return null;

  const avatarImage = AVATAR_IMAGES[member.avatar_type.toLowerCase()]?.[member.avatar_level] 
    || AVATAR_IMAGES.nature[1];
  
  const xpToNext = getXpToNextLevel(member.avatar_level);
  const xpProgress = member.avatar_xp ? (member.avatar_xp / xpToNext) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-card via-card to-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Better Buddy Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Avatar Display */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className={`w-32 h-32 rounded-full bg-black p-2 shadow-2xl ${getGlowColor(member.avatar_type)}`}>
              <img 
                src={avatarImage} 
                alt={member.avatar_type}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Level badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm">
              Lv. {member.avatar_level}
            </div>
            
            {/* Energy indicator */}
            {member.avatar_energy && (
              <div className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-medium ${getEnergyColor(member.avatar_energy)}`}>
                <Zap className="w-3 h-3 inline mr-0.5" />
                {member.avatar_energy}
              </div>
            )}
          </motion.div>

          {/* Username */}
          <div className="text-center">
            <h3 className="text-2xl font-bold">{member.username}</h3>
            <p className="text-muted-foreground capitalize">{member.avatar_type.replace('-', ' ')}</p>
          </div>

          {/* XP Progress */}
          {member.avatar_xp !== undefined && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">XP Progress</span>
                <span className="font-medium">{member.avatar_xp} / {xpToNext}</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-card/50 rounded-xl p-4 text-center border border-border/50">
              <Flame className="w-6 h-6 text-warning mx-auto mb-1" />
              <div className="text-2xl font-bold">{member.current_streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            
            <div className="bg-card/50 rounded-xl p-4 text-center border border-border/50">
              <TrendingDown className="w-6 h-6 text-success mx-auto mb-1" />
              <div className="text-2xl font-bold text-success">{member.daily_reduction}%</div>
              <div className="text-xs text-muted-foreground">Today's Reduction</div>
            </div>
            
            <div className="bg-card/50 rounded-xl p-4 text-center border border-border/50">
              <Clock className="w-6 h-6 text-primary mx-auto mb-1" />
              <div className="text-xl font-bold">
                {Math.floor(member.weekly_avg / 60)}h {member.weekly_avg % 60}m
              </div>
              <div className="text-xs text-muted-foreground">Weekly Avg</div>
            </div>
            
            <div className="bg-card/50 rounded-xl p-4 text-center border border-border/50">
              <Flame className="w-6 h-6 text-accent mx-auto mb-1" />
              <div className="text-2xl font-bold">{member.best_streak || member.current_streak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
