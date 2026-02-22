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
import avatarFlarion from "@/assets/avatar-flarion.png";
import avatarAuarlis from "@/assets/avatar-auarlis.png";
import avatarTeddy from "@/assets/avatar-teddy.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvatarOption {
  type: AvatarType;
  name: string;
  description: string;
  image: string;
  premium?: boolean;
  price?: string;
}

const avatarOptions: AvatarOption[] = [
  {
    type: 'nature',
    name: 'Twiggle',
    description: 'A grounded friend that evolves with your progress',
    image: avatarNature
  },
  {
    type: 'water',
    name: 'Blast',
    description: 'A calm presence that grows with your focus',
    image: avatarWater
  },
  {
    type: 'chungloid',
    name: 'Chungloid',
    description: 'An adorable companion on your digital wellness journey',
    image: avatarChungloid,
    premium: true,
    price: '$3.99'
  },
  {
    type: 'fire',
    name: 'Hot Pocket',
    description: 'A fierce companion that thrives on your determination',
    image: avatarFire,
    premium: true,
    price: '$5.99'
  },
  {
    type: 'teddy',
    name: 'Teddy',
    description: 'A loyal golden companion full of warmth and joy',
    image: avatarTeddy,
    premium: true,
    price: '$5.99'
  },
  {
    type: 'flarion',
    name: 'Flarion',
    description: 'A mystical purple flame spirit with fierce determination',
    image: avatarFlarion,
    premium: true,
    price: '$6.99'
  },
  {
    type: 'auarlis',
    name: 'Auralis',
    description: 'An icy crystal fox with magical frozen powers',
    image: avatarAuarlis
  },
  {
    type: 'chicken-nugget',
    name: 'Chicken Nugget',
    description: 'The ultimate legendary companion of pure power',
    image: avatarChickenNugget
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

  const handleAvatarClick = (avatar: AvatarOption) => {
    const isPremium = avatar.premium;
    const isUnlocked = purchasedAvatars.has(avatar.type);
    
    if (isPremium && !isUnlocked) {
      handlePurchase(avatar.type);
    } else {
      setSelectedAvatar(avatar.type);
    }
  };

  const handleContinue = async () => {
    if (selectedAvatar) {
      setIsLoading(true);
      
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ avatar_type: selectedAvatar })
          .eq('id', user.id);
      }
      
      // Also save to localStorage as fallback
      localStorage.setItem('selectedAvatarType', selectedAvatar);
      
      setIsLoading(false);
      const baseline = localStorage.getItem('baseline');
      navigate(baseline ? '/dashboard' : '/baseline-setup');
    }
  };

  const isAvatarSelectable = (avatar: AvatarOption) => {
    if (!avatar.premium) return true;
    return purchasedAvatars.has(avatar.type);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Choose Your Buddy</h1>
          <p className="text-muted-foreground">
            Select your avatar companion to begin your screen time reduction journey
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {avatarOptions.map((avatar) => {
            const isPremium = avatar.premium;
            const isUnlocked = purchasedAvatars.has(avatar.type);
            const isLocked = isPremium && !isUnlocked;
            
            return (
              <Card
                key={avatar.type}
                className={cn(
                  "p-6 cursor-pointer transition-all duration-300 hover:scale-105 relative",
                  "bg-gradient-card border-2",
                  selectedAvatar === avatar.type
                    ? avatar.type === 'fire' 
                      ? "border-avatar-fire shadow-glow" 
                      : avatar.type === 'water'
                      ? "border-avatar-water shadow-glow"
                      : "border-avatar-nature shadow-glow"
                    : "border-border/50",
                  isLocked && "opacity-90"
                )}
                onClick={() => handleAvatarClick(avatar)}
              >
                <div className="space-y-4">
                  <div className="w-full h-56 overflow-hidden rounded-xl flex items-center justify-center relative">
                    <div className={cn(
                      "absolute inset-0 rounded-xl",
                      avatar.type === 'fire' && "bg-gradient-to-br from-orange-500/20 via-red-500/10 to-yellow-500/20",
                      avatar.type === 'water' && "bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-teal-500/20",
                      avatar.type === 'nature' && "bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-lime-500/20",
                      avatar.type === 'chungloid' && "bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-fuchsia-500/20",
                      avatar.type === 'chicken-nugget' && "bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20",
                      avatar.type === 'flarion' && "bg-gradient-to-br from-purple-500/20 via-violet-500/10 to-indigo-500/20",
                      avatar.type === 'auarlis' && "bg-gradient-to-br from-sky-500/20 via-blue-500/10 to-cyan-500/20",
                      avatar.type === 'teddy' && "bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20"
                    )} />
                    <img 
                      src={avatar.image} 
                      alt={avatar.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110 relative z-10 saturate-[1.2] contrast-[1.05] brightness-[1.05]"
                    />
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="bg-emerald-500 text-white px-5 py-2.5 rounded-full text-lg font-bold flex items-center gap-2 shadow-xl border-2 border-emerald-400">
                          <Lock className="w-5 h-5" />
                          {avatar.price}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className={cn(
                      "text-xl font-bold",
                      avatar.type === 'fire' && "text-avatar-fire",
                      avatar.type === 'water' && "text-avatar-water",
                      avatar.type === 'nature' && "text-avatar-nature",
                      avatar.type === 'chungloid' && "text-primary",
                      avatar.type === 'chicken-nugget' && "text-primary",
                      avatar.type === 'flarion' && "text-purple-400",
                      avatar.type === 'auarlis' && "text-sky-400",
                      avatar.type === 'teddy' && "text-amber-400"
                    )}>
                      {avatar.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {avatar.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedAvatar || !isAvatarSelectable(avatarOptions.find(a => a.type === selectedAvatar)!)}
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