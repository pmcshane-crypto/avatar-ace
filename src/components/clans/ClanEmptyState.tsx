import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, Target, Trophy, Plus, Search } from "lucide-react";
import clansBackground from "@/assets/clans-background.png";

interface ClanEmptyStateProps {
  onJoinClick: () => void;
  onCreateClick: () => void;
  previewClans?: Array<{
    id: string;
    name: string;
    member_count: number;
    icon_emoji: string;
    clan_streak: number;
  }>;
  onPreviewClanJoin?: (clanId: string) => void;
}

export function ClanEmptyState({ 
  onJoinClick, 
  onCreateClick,
  previewClans = [],
  onPreviewClanJoin
}: ClanEmptyStateProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-primary/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 p-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" />
            Unlock the Power of Community
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            You're Stronger with a Clan
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join forces with others to reduce screen time together. Get streak boosts, 
            shared goals, bonus XP, and compete in weekly challenges.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {[
              { icon: Zap, label: "Streak Boosts", desc: "+10% XP" },
              { icon: Target, label: "Shared Goals", desc: "Daily targets" },
              { icon: Trophy, label: "Clan Rewards", desc: "Exclusive items" },
              { icon: Users, label: "Accountability", desc: "Team support" },
            ].map((benefit, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card/50 border border-border/50 space-y-2">
                <benefit.icon className="w-6 h-6 text-primary mx-auto" />
                <div className="font-semibold text-sm">{benefit.label}</div>
                <div className="text-xs text-muted-foreground">{benefit.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={onJoinClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25"
            >
              <Search className="w-5 h-5 mr-2" />
              Join a Clan
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={onCreateClick}
              className="border-primary/50 text-foreground hover:bg-primary/10 px-8 py-6 text-lg font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create a Clan
            </Button>
          </div>
        </div>

        {/* Background Image */}
        <div className="relative mt-4">
          <img 
            src={clansBackground} 
            alt="Better Buddy Avatars" 
            className="w-72 mx-auto opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      </div>

      {/* Preview Clans */}
      {previewClans.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center text-muted-foreground">
            Popular Clans to Join
          </h2>
          <div className="grid gap-3">
            {previewClans.slice(0, 3).map((clan) => (
              <Card 
                key={clan.id} 
                className="bg-card/50 border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => onPreviewClanJoin?.(clan.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                      {clan.icon_emoji}
                    </div>
                    <div>
                      <div className="font-semibold">{clan.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {clan.member_count} members
                        </span>
                        {clan.clan_streak > 0 && (
                          <span className="flex items-center gap-1 text-warning">
                            🔥 {clan.clan_streak}-day streak
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewClanJoin?.(clan.id);
                    }}
                  >
                    Join
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}