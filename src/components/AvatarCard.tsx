import { Avatar, EnergyLevel } from "@/types/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Zap, TrendingUp } from "lucide-react";
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

interface AvatarCardProps {
  avatar: Avatar;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const getEnergyColor = (energy: EnergyLevel) => {
  switch (energy) {
    case 'high':
      return 'text-energy-high';
    case 'medium':
      return 'text-energy-medium';
    case 'low':
      return 'text-energy-low';
  }
};

const getEnergyLabel = (energy: EnergyLevel) => {
  switch (energy) {
    case 'high':
      return 'HIGH ENERGY';
    case 'medium':
      return 'MEDIUM ENERGY';
    case 'low':
      return 'LOW ENERGY';
  }
};

// Micro-state animations based on energy
const getEnergyAnimations = (energy: EnergyLevel) => {
  switch (energy) {
    case 'high':
      return {
        float: { y: [0, -20, 0] },
        floatTransition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
        glow: { scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] },
        glowTransition: { duration: 2, repeat: Infinity },
        pulse: true,
        droop: undefined,
      };
    case 'medium':
      return {
        float: { y: [0, -10, 0] },
        floatTransition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
        glow: { scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] },
        glowTransition: { duration: 3, repeat: Infinity },
        pulse: false,
        droop: undefined,
      };
    case 'low':
      return {
        float: { y: [0, -3, 0] },
        floatTransition: { duration: 8, repeat: Infinity, ease: "easeInOut" as const },
        glow: { scale: [1, 0.98, 1], opacity: [0.2, 0.3, 0.2] },
        glowTransition: { duration: 4, repeat: Infinity },
        pulse: false,
        droop: { rotate: [0, -3, 0] },
        droopTransition: { duration: 4, repeat: Infinity },
      };
  }
};

export const AvatarCard = ({ avatar, showStats = true, size = 'md', animate = true }: AvatarCardProps) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-64 h-64'
  };

  const getAvatarImage = () => {
    switch (avatar.type) {
      case 'fire':
        if (avatar.level >= 3) return avatarFireLevel3;
        if (avatar.level >= 2) return avatarFireLevel2;
        return avatarFire;
      case 'water':
        if (avatar.level >= 3) return avatarWaterLevel3;
        if (avatar.level >= 2) return avatarWaterLevel2;
        return avatarWater;
      case 'nature':
        if (avatar.level >= 3) return avatarNatureLevel3;
        if (avatar.level >= 2) return avatarNatureLevel2;
        return avatarNature;
      case 'chungloid':
        if (avatar.level >= 3) return avatarChungloidLevel3;
        if (avatar.level >= 2) return avatarChungloidLevel2;
        return avatarChungloid;
      case 'chicken-nugget':
        if (avatar.level >= 3) return avatarChickenNuggetLevel3;
        if (avatar.level >= 2) return avatarChickenNuggetLevel2;
        return avatarChickenNugget;
      case 'flarion':
        if (avatar.level >= 3) return avatarFlarionLevel3;
        if (avatar.level >= 2) return avatarFlarionLevel2;
        return avatarFlarion;
      case 'auarlis':
        if (avatar.level >= 3) return avatarAuarlisLevel3;
        if (avatar.level >= 2) return avatarAuarlisLevel2;
        return avatarAuarlis;
      case 'teddy':
        if (avatar.level >= 3) return avatarTeddyLevel3;
        if (avatar.level >= 2) return avatarTeddyLevel2;
        return avatarTeddy;
      default:
        return avatarNature;
    }
  };

  const energyAnimations = getEnergyAnimations(avatar.energy);

  return (
    <div className="relative">
      {/* Avatar Container */}
      <motion.div 
        className={cn("relative mx-auto", sizeClasses[size])}
        animate={animate ? energyAnimations.float : undefined}
        transition={animate ? energyAnimations.floatTransition : undefined}
      >
        {/* Glow Effect - now animated based on energy */}
        <motion.div 
          className={cn(
            "absolute inset-0 rounded-full blur-2xl",
            avatar.type === 'fire' && "bg-avatar-fire",
            avatar.type === 'water' && "bg-avatar-water",
            avatar.type === 'nature' && "bg-avatar-nature",
            avatar.type === 'chungloid' && "bg-purple-500",
            avatar.type === 'chicken-nugget' && "bg-amber-500",
            avatar.type === 'flarion' && "bg-violet-500",
            avatar.type === 'auarlis' && "bg-sky-400",
            avatar.type === 'teddy' && "bg-amber-400",
          )}
          animate={animate ? energyAnimations.glow : { opacity: 0.6 }}
          transition={animate ? energyAnimations.glowTransition : undefined}
        />
        
        {/* Avatar Image with Black Circle Background */}
        <motion.div 
          className={cn(
            "relative w-full h-full rounded-full overflow-hidden shadow-energy bg-black",
            avatar.type === 'fire' && "ring-4 ring-avatar-fire",
            avatar.type === 'water' && "ring-4 ring-avatar-water",
            avatar.type === 'nature' && "ring-4 ring-avatar-nature",
            avatar.type === 'chungloid' && "ring-4 ring-purple-500",
            avatar.type === 'chicken-nugget' && "ring-4 ring-amber-500",
            avatar.type === 'flarion' && "ring-4 ring-violet-500",
            avatar.type === 'auarlis' && "ring-4 ring-sky-400",
            avatar.type === 'teddy' && "ring-4 ring-amber-400"
          )}
          animate={animate && avatar.energy === 'low' ? energyAnimations.droop : undefined}
          transition={animate && avatar.energy === 'low' && energyAnimations.droopTransition ? energyAnimations.droopTransition : undefined}
        >
          <img 
            src={getAvatarImage()} 
            alt={avatar.name}
            className={cn(
              "w-full h-full object-contain scale-90 transition-all duration-300",
              avatar.energy === 'low' && "saturate-75 brightness-90",
              avatar.energy === 'high' && "saturate-110 brightness-110"
            )}
          />
          
          {/* Energy-based overlay effects */}
          {avatar.energy === 'high' && animate && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          {avatar.energy === 'low' && animate && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          )}
        </motion.div>
      </motion.div>

      {/* Stats Section */}
      {showStats && (
        <div className="mt-6 space-y-3">
          {/* Energy Status */}
          <motion.div 
            className="flex items-center justify-center gap-2"
            animate={avatar.energy === 'high' && animate ? { scale: [1, 1.05, 1] } : undefined}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Zap className={cn("w-5 h-5", getEnergyColor(avatar.energy))} />
            <span className={cn("font-bold text-sm", getEnergyColor(avatar.energy))}>
              {getEnergyLabel(avatar.energy)}
            </span>
          </motion.div>

          {/* Level & XP */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-foreground font-semibold">Level {avatar.level}</span>
            </div>
            
            {/* XP Bar */}
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-energy relative"
                initial={{ width: 0 }}
                animate={{ width: `${(avatar.xp / avatar.xpToNextLevel) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            </div>
            <p className="text-xs text-muted-foreground">
              {avatar.xp} / {avatar.xpToNextLevel} XP
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
