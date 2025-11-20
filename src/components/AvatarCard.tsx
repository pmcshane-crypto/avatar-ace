import { Avatar, EnergyLevel } from "@/types/avatar";
import { cn } from "@/lib/utils";
import { Zap, TrendingUp } from "lucide-react";
import avatarFire from "@/assets/avatar-fire.png";
import avatarFireLevel2 from "@/assets/avatar-fire-level2.png";
import avatarWater from "@/assets/avatar-water.png";
import avatarNature from "@/assets/avatar-nature.png";

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

export const AvatarCard = ({ avatar, showStats = true, size = 'md', animate = true }: AvatarCardProps) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-64 h-64'
  };

  const getAvatarImage = () => {
    switch (avatar.type) {
      case 'fire':
        if (avatar.level >= 2) return avatarFireLevel2;
        return avatarFire;
      case 'water':
        return avatarWater;
      case 'nature':
        return avatarNature;
    }
  };

  return (
    <div className="relative">
      {/* Avatar Container */}
      <div className={cn(
        "relative mx-auto",
        sizeClasses[size],
        animate && "animate-float"
      )}>
        {/* Glow Effect */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-2xl opacity-60",
          avatar.type === 'fire' && "bg-avatar-fire",
          avatar.type === 'water' && "bg-avatar-water",
          avatar.type === 'nature' && "bg-avatar-nature",
          animate && "animate-pulse-glow"
        )} />
        
        {/* Avatar Image */}
        <div className={cn(
          "relative w-full h-full rounded-full overflow-hidden shadow-energy",
          avatar.type === 'fire' && "ring-4 ring-avatar-fire",
          avatar.type === 'water' && "ring-4 ring-avatar-water",
          avatar.type === 'nature' && "ring-4 ring-avatar-nature"
        )}>
          <img 
            src={getAvatarImage()} 
            alt={avatar.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Stats Section */}
      {showStats && (
        <div className="mt-6 space-y-3">
          {/* Energy Status */}
          <div className="flex items-center justify-center gap-2">
            <Zap className={cn("w-5 h-5", getEnergyColor(avatar.energy))} />
            <span className={cn("font-bold text-sm", getEnergyColor(avatar.energy))}>
              {getEnergyLabel(avatar.energy)}
            </span>
          </div>

          {/* Level & XP */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-foreground font-semibold">Level {avatar.level}</span>
            </div>
            
            {/* XP Bar */}
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-energy transition-all duration-500 relative"
                style={{ width: `${(avatar.xp / avatar.xpToNextLevel) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
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
