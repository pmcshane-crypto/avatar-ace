import { useRef } from "react";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedClanCard } from "./FeaturedClanCard";

interface Clan {
  id: string;
  name: string;
  description?: string;
  icon_emoji: string;
  member_count: number;
  avg_reduction: number;
  clan_streak: number;
  clan_level: number;
  clan_xp: number;
  is_public: boolean;
}

interface FeaturedClansProps {
  clans: Clan[];
  onJoinClan: (clanId: string) => void;
}

export function FeaturedClans({ clans, onJoinClan }: FeaturedClansProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 340;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Assign badges based on stats
  const clansWithBadges = clans.map((clan, index) => {
    let badge: 'top-performer' | 'highest-streak' | 'trending' | undefined;
    
    // Top performer - highest reduction
    if (clan.avg_reduction === Math.max(...clans.map(c => c.avg_reduction))) {
      badge = 'top-performer';
    }
    // Highest streak
    else if (clan.clan_streak === Math.max(...clans.map(c => c.clan_streak))) {
      badge = 'highest-streak';
    }
    // Trending - most members relative to level
    else if (index < 3) {
      badge = 'trending';
    }
    
    return { ...clan, badge };
  });

  if (clans.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold">Featured Clans</h2>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {clansWithBadges.map((clan) => (
          <div key={clan.id} className="snap-start">
            <FeaturedClanCard
              {...clan}
              onJoin={() => onJoinClan(clan.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
