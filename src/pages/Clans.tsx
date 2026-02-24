import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClan } from '@/hooks/useClan';
import { ClanMember } from '@/types/clan';
import { ClanStatusCard } from '@/components/clans/ClanStatusCard';
import { LiveLeaderboard } from '@/components/clans/LiveLeaderboard';
import { ClanGoalCard } from '@/components/clans/ClanGoalCard';
import { ChampionsBanner } from '@/components/clans/ChampionsBanner';
import { MemberProfilePreview } from '@/components/clans/MemberProfilePreview';
import { InviteCTA } from '@/components/clans/InviteCTA';
import { NoClanView } from '@/components/clans/NoClanView';
import { TimeCountdown } from '@/components/clans/TimeCountdown';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Settings, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Clans() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    clan,
    members,
    userRank,
    dailyChampion,
    weeklyMVP,
    todayTotal,
    dynamicGoalMinutes,
    goalMet,
    isLoading,
    userId,
    refresh,
  } = useClan();

  const [selectedMember, setSelectedMember] = useState<ClanMember | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleReact = async (memberId: string, emoji: string) => {
    // In a real implementation, this would save to the database
    toast({ title: `${emoji} sent!` });
  };

  const handleMemberTap = (member: ClanMember) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  const currentUserMember = members.find(m => m.user_id === userId) || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-radial from-background via-background to-primary/5 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!clan) {
    return <NoClanView userId={userId} onJoinClan={refresh} />;
  }

  return (
    <div className="min-h-screen bg-gradient-radial from-background via-background to-primary/5">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/30 px-4 py-3"
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{clan.icon_emoji}</span>
              <div>
                <h1 className="font-bold text-foreground">{clan.name}</h1>
                <p className="text-xs text-muted-foreground">Level {clan.clan_level}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={refresh}
              className="rounded-full"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
        {/* Time countdown */}
        <TimeCountdown />

        {/* User's clan status */}
        <ClanStatusCard
          member={currentUserMember}
          members={members}
          userId={userId}
          isDailyChampion={dailyChampion?.user_id === userId}
          isWeeklyMVP={weeklyMVP?.user_id === userId}
        />

        {/* Clan goal */}
        <ClanGoalCard
          clan={clan}
          memberCount={members.length}
          todayTotal={todayTotal}
          goalMet={goalMet}
          dynamicGoalMinutes={dynamicGoalMinutes}
        />

        {/* Champions */}
        <ChampionsBanner
          dailyChampion={dailyChampion}
          weeklyMVP={weeklyMVP}
        />

        {/* Live leaderboard */}
        <LiveLeaderboard
          members={members}
          userId={userId}
          dailyChampionId={dailyChampion?.user_id || null}
          weeklyMVPId={weeklyMVP?.user_id || null}
          onReact={handleReact}
          onMemberTap={handleMemberTap}
        />

        {/* Invite CTA */}
        <InviteCTA
          clanId={clan.id}
          clanName={clan.name}
          memberCount={members.length}
        />
      </main>

      {/* Member profile preview */}
      <MemberProfilePreview
        member={selectedMember}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        isDailyChampion={selectedMember?.user_id === dailyChampion?.user_id}
        isWeeklyMVP={selectedMember?.user_id === weeklyMVP?.user_id}
      />
    </div>
  );
}
