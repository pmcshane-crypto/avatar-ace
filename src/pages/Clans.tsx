import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClan } from '@/hooks/useClan';
import { ClanMember } from '@/types/clan';
import { ClanStatusCard } from '@/components/clans/ClanStatusCard';
import { LiveLeaderboard } from '@/components/clans/LiveLeaderboard';
import { ClanGoalCard } from '@/components/clans/ClanGoalCard';
import { ChampionsBanner } from '@/components/clans/ChampionsBanner';
import { MemberProfilePreview } from '@/components/clans/MemberProfilePreview';
import { ClanActionsCard } from '@/components/clans/ClanActionsCard';
import { SwitchClanModal } from '@/components/clans/SwitchClanModal';
import { NoClanView } from '@/components/clans/NoClanView';
import { TimeCountdown } from '@/components/clans/TimeCountdown';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, LogOut, RefreshCw, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Clans() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    clan, members, userRank, dailyChampion, weeklyMVP,
    todayTotal, dynamicGoalMinutes, goalMet, isLoading, userId, refresh,
  } = useClan();

  const [selectedMember, setSelectedMember] = useState<ClanMember | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/auth');
    };
    checkAuth();
  }, [navigate]);

  const handleReact = async (memberId: string, emoji: string) => {
    toast({ title: `${emoji} sent!` });
  };

  const handleMemberTap = (member: ClanMember) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  const handleLeaveClan = async () => {
    if (!userId || !clan) return;
    setIsLeaving(true);
    try {
      await supabase.from('clan_members').delete().eq('user_id', userId).eq('clan_id', clan.id);
      toast({ title: 'Left clan' });
      refresh();
    } catch (error: any) {
      toast({ title: 'Error leaving clan', variant: 'destructive' });
    } finally {
      setIsLeaving(false);
    }
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
      {/* Clan Identity Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/30 px-4 pt-14 pb-4"
      >
        <div className="max-w-2xl mx-auto">
          {/* Top row: back + leave */}
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeaveClan}
              disabled={isLeaving}
              className="text-xs text-muted-foreground hover:text-destructive gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Leave
            </Button>
          </div>

          {/* Clan identity - centered */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl">{clan.icon_emoji}</span>
            <h1 className="text-2xl font-bold text-foreground">{clan.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Level {clan.clan_level}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{members.length} members</span>
              <span>·</span>
              <span>🔥 {clan.clan_streak} streak</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto p-4 space-y-4 pb-20">
        {/* Actions: Invite + codes */}
        <ClanActionsCard clanId={clan.id} clanName={clan.name} />

        {/* Switch clan button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-muted-foreground"
          onClick={() => setShowSwitchModal(true)}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Switch Clan
        </Button>

        {/* Time countdown */}
        <TimeCountdown />

        {/* Your rank */}
        <ClanStatusCard
          member={currentUserMember}
          members={members}
          userId={userId}
          isDailyChampion={dailyChampion?.user_id === userId}
          isWeeklyMVP={weeklyMVP?.user_id === userId}
        />

        {/* Daily goal */}
        <ClanGoalCard
          clan={clan}
          memberCount={members.length}
          todayTotal={todayTotal}
          goalMet={goalMet}
          dynamicGoalMinutes={dynamicGoalMinutes}
        />

        {/* Champions */}
        <ChampionsBanner dailyChampion={dailyChampion} weeklyMVP={weeklyMVP} />

        {/* Leaderboard */}
        <LiveLeaderboard
          members={members}
          userId={userId}
          dailyChampionId={dailyChampion?.user_id || null}
          weeklyMVPId={weeklyMVP?.user_id || null}
          onReact={handleReact}
          onMemberTap={handleMemberTap}
        />
      </main>

      {/* Switch Clan Modal */}
      <SwitchClanModal
        isOpen={showSwitchModal}
        onClose={() => setShowSwitchModal(false)}
        userId={userId}
        currentClanId={clan.id}
        onSwitch={refresh}
      />

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
