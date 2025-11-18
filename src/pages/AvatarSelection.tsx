import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AvatarType } from "@/types/avatar";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import avatarFire from "@/assets/avatar-fire.png";
import avatarWater from "@/assets/avatar-water.png";
import avatarNature from "@/assets/avatar-nature.png";

const avatarOptions: Array<{ type: AvatarType; name: string; description: string; image: string }> = [
  {
    type: 'fire',
    name: 'Blaze',
    description: 'A fierce companion that thrives on your determination',
    image: avatarFire
  },
  {
    type: 'water',
    name: 'Aqua',
    description: 'A calm presence that grows with your focus',
    image: avatarWater
  },
  {
    type: 'nature',
    name: 'Terra',
    description: 'A grounded friend that evolves with your progress',
    image: avatarNature
  }
];

const AvatarSelection = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedAvatar) {
      localStorage.setItem('selectedAvatarType', selectedAvatar);
      const baseline = localStorage.getItem('baseline');
      navigate(baseline ? '/dashboard' : '/baseline-setup');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Choose Your Buddy</h1>
          <p className="text-muted-foreground">
            Select your avatar companion to begin your screen time reduction journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {avatarOptions.map((avatar) => (
            <Card
              key={avatar.type}
              className={cn(
                "p-6 cursor-pointer transition-all duration-300 hover:scale-105",
                "bg-gradient-card border-2",
                selectedAvatar === avatar.type
                  ? avatar.type === 'fire' 
                    ? "border-avatar-fire shadow-glow" 
                    : avatar.type === 'water'
                    ? "border-avatar-water shadow-glow"
                    : "border-avatar-nature shadow-glow"
                  : "border-border/50"
              )}
              onClick={() => setSelectedAvatar(avatar.type)}
            >
              <div className="space-y-4">
                <div className="w-full h-48 overflow-hidden rounded-lg flex items-center justify-center bg-gradient-subtle">
                  <img 
                    src={avatar.image} 
                    alt={avatar.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="text-center space-y-2">
                  <h3 className={cn(
                    "text-xl font-bold",
                    avatar.type === 'fire' && "text-avatar-fire",
                    avatar.type === 'water' && "text-avatar-water",
                    avatar.type === 'nature' && "text-avatar-nature"
                  )}>
                    {avatar.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {avatar.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedAvatar}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg"
            size="lg"
          >
            Continue
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection;
