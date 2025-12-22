import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Gift, CheckCircle, Target } from "lucide-react";

interface ClanChallenge {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  reward_xp: number;
  reward_description: string;
  ends_at: string;
  is_completed: boolean;
}

interface ClanChallengesProps {
  challenges: ClanChallenge[];
}

function getTimeRemaining(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return "Ended";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

export function ClanChallenges({ challenges }: ClanChallengesProps) {
  const activeChallenge = challenges.filter(c => !c.is_completed);
  const completedChallenges = challenges.filter(c => c.is_completed);

  return (
    <div className="space-y-6">
      {/* Active Challenges */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Active Challenges
        </h3>
        
        {activeChallenge.length === 0 ? (
          <Card className="bg-card/50 border-dashed">
            <CardContent className="p-6 text-center text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active challenges right now</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeChallenge.map((challenge) => {
              const progress = (challenge.current_value / challenge.target_value) * 100;
              
              return (
                <Card 
                  key={challenge.id} 
                  className="bg-gradient-to-br from-card to-card/80 border-primary/20 overflow-hidden"
                >
                  {/* Glow effect */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <Badge 
                        variant="outline" 
                        className="bg-warning/10 text-warning border-warning/30 flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        {getTimeRemaining(challenge.ends_at)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {challenge.current_value} / {challenge.target_value}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, progress)} 
                        className="h-3 bg-secondary [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent"
                      />
                    </div>
                    
                    {/* Rewards */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-accent" />
                        <span className="font-medium">Reward</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-accent">+{challenge.reward_xp} XP</div>
                        {challenge.reward_description && (
                          <div className="text-xs text-muted-foreground">
                            {challenge.reward_description}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Completed
          </h3>
          
          <div className="grid gap-3">
            {completedChallenges.map((challenge) => (
              <Card 
                key={challenge.id} 
                className="bg-success/5 border-success/20"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <div className="font-medium">{challenge.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Completed
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30">
                    +{challenge.reward_xp} XP
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}