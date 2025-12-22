import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, TrendingDown, Flame, Users, Target, 
  MessageCircle, Award, Clock, ArrowLeft, LogOut,
  Crown, Medal, Star
} from "lucide-react";
import { ClanMemberRow } from "./ClanMemberRow";
import { ClanChallenges } from "./ClanChallenges";
import { ClanChat } from "./ClanChat";

interface ClanMember {
  user_id: string;
  username: string;
  avatar_type: string;
  daily_reduction: number;
  weekly_avg: number;
  current_streak: number;
  today_minutes?: number;
  contribution: number;
  last_active?: string;
}

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

interface ClanHubProps {
  clanId: string;
  clanName: string;
  clanDescription?: string;
  icon_emoji: string;
  clan_level: number;
  clan_xp: number;
  clan_streak: number;
  daily_goal_minutes: number;
  members: ClanMember[];
  challenges: ClanChallenge[];
  currentUserId: string;
  onBack: () => void;
  onLeave: () => void;
  onSendMessage: (message: string) => void;
}

const XP_PER_LEVEL = 1000;

export function ClanHub({
  clanId,
  clanName,
  clanDescription,
  icon_emoji,
  clan_level,
  clan_xp,
  clan_streak,
  daily_goal_minutes,
  members,
  challenges,
  currentUserId,
  onBack,
  onLeave,
  onSendMessage,
}: ClanHubProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate clan daily goal progress
  const totalDailyReduction = members.reduce((sum, m) => {
    const target = daily_goal_minutes;
    const reduction = Math.max(0, target - (m.today_minutes || target));
    return sum + reduction;
  }, 0);
  const clanGoalTarget = daily_goal_minutes * members.length;
  const goalProgress = clanGoalTarget > 0 ? (totalDailyReduction / clanGoalTarget) * 100 : 0;
  
  // Get daily and weekly winners
  const sortedByDaily = [...members].sort((a, b) => b.daily_reduction - a.daily_reduction);
  const sortedByWeekly = [...members].sort((a, b) => a.weekly_avg - b.weekly_avg);
  const dailyWinner = sortedByDaily[0];
  const weeklyWinner = sortedByWeekly[0];
  
  // XP progress
  const xpProgress = (clan_xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;

  return (
    <div className="space-y-6">
      {/* Clan Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/30 via-card to-card border border-primary/20">
        {clan_streak >= 7 && (
          <div className="absolute top-0 right-0 w-48 h-48 bg-warning/20 rounded-full blur-3xl" />
        )}
        
        <div className="relative z-10 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center text-4xl border border-primary/30">
                {icon_emoji}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold">{clanName}</h1>
                <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {members.length} members
                  </span>
                  <span className="flex items-center gap-1 text-warning">
                    <Flame className="w-4 h-4" />
                    {clan_streak} day streak
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">
                Level {clan_level}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {clan_xp % XP_PER_LEVEL}/{XP_PER_LEVEL} XP
              </div>
            </div>
          </div>
          
          {/* XP Bar */}
          <div className="mt-4">
            <Progress value={xpProgress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Today's Clan Goal */}
      <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-success" />
              <span className="font-semibold">Today's Clan Goal</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Collectively reduce {(daily_goal_minutes * members.length / 60).toFixed(1)} hours
            </span>
          </div>
          <Progress 
            value={Math.min(100, goalProgress)} 
            className="h-4 bg-success/20 [&>div]:bg-gradient-to-r [&>div]:from-success [&>div]:to-accent"
          />
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-success font-medium">{Math.round(goalProgress)}% complete</span>
            <span className="text-muted-foreground">
              {Math.round(totalDailyReduction)} / {clanGoalTarget} min reduced
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 bg-card/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Winners Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-warning/10 to-card border-warning/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-warning" />
                  Daily Champion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyWinner ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <div className="font-semibold">{dailyWinner.username}</div>
                        <div className="text-sm text-muted-foreground capitalize">{dailyWinner.avatar_type}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {dailyWinner.daily_reduction}%
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data yet today</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-card border-accent/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Medal className="w-5 h-5 text-accent" />
                  Weekly MVP
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyWinner ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <Star className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold">{weeklyWinner.username}</div>
                        <div className="text-sm text-muted-foreground capitalize">{weeklyWinner.avatar_type}</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-success">
                      {Math.floor(weeklyWinner.weekly_avg / 60)}h {weeklyWinner.weekly_avg % 60}m
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <Flame className="w-6 h-6 text-warning mx-auto mb-1" />
                <div className="text-2xl font-bold">{clan_streak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <TrendingDown className="w-6 h-6 text-success mx-auto mb-1" />
                <div className="text-2xl font-bold">
                  {members.length > 0 
                    ? Math.round(members.reduce((s, m) => s + m.daily_reduction, 0) / members.length)
                    : 0}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Reduction</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <Award className="w-6 h-6 text-primary mx-auto mb-1" />
                <div className="text-2xl font-bold">{challenges.filter(c => c.is_completed).length}</div>
                <div className="text-xs text-muted-foreground">Challenges Won</div>
              </CardContent>
            </Card>
          </div>

          {/* Top 5 Members Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Contributors Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sortedByDaily.slice(0, 5).map((member, idx) => (
                <ClanMemberRow 
                  key={member.user_id}
                  rank={idx + 1}
                  {...member}
                  isCurrentUser={member.user_id === currentUserId}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Members</span>
                <Badge variant="outline">{members.length} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sortedByDaily.map((member, idx) => (
                <ClanMemberRow 
                  key={member.user_id}
                  rank={idx + 1}
                  {...member}
                  isCurrentUser={member.user_id === currentUserId}
                  showDetails
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges">
          <ClanChallenges challenges={challenges} />
        </TabsContent>

        <TabsContent value="chat">
          <ClanChat 
            clanId={clanId} 
            currentUserId={currentUserId}
            onSendMessage={onSendMessage}
          />
        </TabsContent>
      </Tabs>

      {/* Leave Clan Button */}
      <Button
        variant="ghost"
        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={onLeave}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Leave Clan
      </Button>
    </div>
  );
}