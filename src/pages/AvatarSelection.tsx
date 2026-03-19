import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AvatarType } from "@/types/avatar";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import avatarFire from "@/assets/avatar-fire.png";
import avatarWater from "@/assets/avatar-water.png";
import avatarNature from "@/assets/avatar-nature.png";
import avatarChungloid from "@/assets/avatar-chungloid.png";
import avatarChickenNugget from "@/assets/avatar-chicken-nugget.png";
import avatarFlarion from "@/assets/avatar-flarion.png";
import avatarAuarlis from "@/assets/avatar-auarlis.png";
import avatarTeddy from "@/assets/avatar-teddy.png";
import { supabase } from "@/integrations/supabase/client";

interface AvatarOption {
  type: AvatarType;
  name: string;
  description: string;
  image: string;
}

const avatarOptions: AvatarOption[] = [
  { type: 'nature', name: 'Twiggle', description: 'A grounded friend that evolves with your progress', image: avatarNature },
  { type: 'water', name: 'Blast', description: 'A calm presence that grows with your focus', image: avatarWater },
  { type: 'chungloid', name: 'Chungloid', description: 'An adorable companion on your digital wellness journey', image: avatarChungloid },
  { type: 'fire', name: 'Hot Pocket', description: 'A fierce companion that thrives on your determination', image: avatarFire },
  { type: 'teddy', name: 'Teddy', description: 'A loyal golden companion full of warmth and joy', image: avatarTeddy },
  { type: 'flarion', name: 'Flarion', description: 'A mystical purple flame spirit with fierce determination', image: avatarFlarion },
  { type: 'auarlis', name: 'Auralis', description: 'An icy crystal fox with magical frozen powers', image: avatarAuarlis },
  { type: 'chicken-nugget', name: 'Chicken Nugget', description: 'The ultimate legendary companion of pure power', image: avatarChickenNugget },
];

const AvatarSelection = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (selectedAvatar) {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ avatar_type: selectedAvatar })
          .eq('id', user.id);
      }
      
      localStorage.setItem('selectedAvatarType', selectedAvatar);
      
      setIsLoading(false);
      navigate('/dashboard');
    }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col p-2 overflow-hidden">
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-1 min-h-0">
        <div className="text-center pt-16 pb-1">
          <motion.h1
            className="text-3xl font-bold text-foreground"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Choose Your Better Buddy
          </motion.h1>
        </div>

        <div className="grid grid-cols-3 gap-x-1 gap-y-2 mt-2">
          {avatarOptions.map((avatar, index) => (
            <div
              key={avatar.type}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col items-center gap-0.5",
              )}
              onClick={() => setSelectedAvatar(avatar.type)}
            >
              <div className={cn(
                "aspect-square w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 transition-all duration-300",
                selectedAvatar === avatar.type
                  ? avatar.type === 'fire' 
                    ? "border-avatar-fire shadow-glow" 
                    : avatar.type === 'water'
                    ? "border-avatar-water shadow-glow"
                    : "border-avatar-nature shadow-glow"
                  : "border-border/50"
              )}>
                <motion.img 
                  src={avatar.image} 
                  alt={avatar.name}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                  className={cn(
                    "object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]",
                    (avatar.type === 'nature' || avatar.type === 'water') ? "w-[140%] h-[140%]" : "w-full h-full"
                  )}
                />
              </div>
              <p className={cn(
                "text-[18px] sm:text-xl font-bold text-center leading-tight truncate w-full",
                avatar.type === 'fire' && "text-avatar-fire",
                avatar.type === 'water' && "text-avatar-water",
                avatar.type === 'nature' && "text-avatar-nature",
                avatar.type === 'chungloid' && "text-pink-400",
                avatar.type === 'flarion' && "text-purple-400",
                avatar.type === 'auarlis' && "text-sky-400",
                avatar.type === 'teddy' && "text-amber-400"
              )}>
                {avatar.type === 'chicken-nugget' ? (
                  <span>
                    {avatar.name.split('').map((char, i) => (
                      <span key={i} style={{ color: char === ' ' ? undefined : i % 2 === 0 ? 'hsl(210, 100%, 60%)' : 'hsl(330, 100%, 60%)' }}>
                        {char}
                      </span>
                    ))}
                  </span>
                ) : avatar.name}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 py-2">
          <Button
            onClick={handleContinue}
            disabled={!selectedAvatar || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-5 text-base"
            size="lg"
          >
            Continue
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => {
              localStorage.removeItem('onboardingComplete');
              navigate('/onboarding');
            }}
          >
            View onboarding again
          </Button>
        </div>
    </div>
  );
};

export default AvatarSelection;
