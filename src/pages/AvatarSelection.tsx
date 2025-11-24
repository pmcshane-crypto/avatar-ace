import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AvatarType } from "@/types/avatar";
import { ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import avatarFire from "@/assets/avatar-fire.png";
import avatarWater from "@/assets/avatar-water.png";
import avatarNature from "@/assets/avatar-nature.png";
import avatarChungloid from "@/assets/avatar-chungloid.png";
import avatarChickenNugget from "@/assets/avatar-chicken-nugget.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const avatarOptions: Array<{ type: AvatarType; name: string; description: string; image: string; premium?: boolean }> = [
  {
    type: 'fire',
    name: 'Hot Pocket',
    description: 'A fierce companion that thrives on your determination',
    image: avatarFire,
    premium: true
  },
  {
    type: 'water',
    name: 'Nugget',
    description: 'A calm presence that grows with your focus',
    image: avatarWater
  },
  {
    type: 'nature',
    name: 'Twiggle',
    description: 'A grounded friend that evolves with your progress',
    image: avatarNature,
    premium: true
  },
  {
    type: 'chungloid',
    name: 'Chungloid',
    description: 'An adorable companion on your digital wellness journey',
    image: avatarChungloid,
    premium: true
  },
  {
    type: 'chicken-nugget',
    name: 'Chicken Nugget',
    description: 'The ultimate companion that evolves into pure power',
    image: avatarChickenNugget,
    premium: true
  }
];

const AvatarSelection = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType | null>(null);
  const [purchasedAvatars, setPurchasedAvatars] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    fetchPurchasedAvatars();
    
    const payment = searchParams.get('payment');
    const avatar = searchParams.get('avatar');
    
    if (payment === 'success' && avatar) {
      toast({
        title: "Purchase Successful!",
        description: `You've unlocked the ${avatar} avatar!`,
      });
      fetchPurchasedAvatars();
    } else if (payment === 'canceled') {
      toast({
        title: "Purchase Canceled",
        description: "You can purchase the avatar anytime.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const fetchPurchasedAvatars = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('purchased_avatars')
      .select('avatar_type')
      .eq('user_id', user.id);

    if (data) {
      setPurchasedAvatars(new Set(data.map(p => p.avatar_type)));
    }
  };

  const handlePurchase = async (avatarType: AvatarType) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to purchase avatars.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('purchase-avatar', {
        body: { avatarType }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = (avatar: typeof avatarOptions[0]) => {
    if (avatar.premium && !purchasedAvatars.has(avatar.type)) {
      handlePurchase(avatar.type);
    } else {
      setSelectedAvatar(avatar.type);
    }
  };

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

        <div className="grid md:grid-cols-4 gap-4">
          {avatarOptions.map((avatar) => {
            const isPremium = avatar.premium && !purchasedAvatars.has(avatar.type);
            const isUnlocked = !avatar.premium || purchasedAvatars.has(avatar.type);
            
            return (
              <Card
                key={avatar.type}
                className={cn(
                  "p-6 cursor-pointer transition-all duration-300 hover:scale-105 relative",
                  "bg-gradient-card border-2",
                  selectedAvatar === avatar.type && isUnlocked
                    ? avatar.type === 'fire' 
                      ? "border-avatar-fire shadow-glow" 
                      : avatar.type === 'water'
                      ? "border-avatar-water shadow-glow"
                      : "border-avatar-nature shadow-glow"
                    : "border-border/50",
                  isPremium && "opacity-75"
                )}
                onClick={() => handleAvatarClick(avatar)}
              >
                {isPremium && (
                  <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    ${avatar.type === 'chicken-nugget' ? '38.99' : avatar.type === 'chungloid' ? '14.99' : avatar.type === 'fire' ? '8.99' : '5.99'}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="w-full h-48 overflow-hidden rounded-lg flex items-center justify-center bg-gradient-subtle relative">
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
                      avatar.type === 'nature' && "text-avatar-nature",
                      avatar.type === 'chungloid' && "text-primary",
                      avatar.type === 'chicken-nugget' && "text-primary"
                    )}>
                      {avatar.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {avatar.description}
                    </p>
                    {isPremium && (
                      <p className="text-xs text-primary font-semibold">
                        Click to unlock
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
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
