import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClanEmptyState, ClanCard, ClanHub, DiscoverClans } from "@/components/clans";
import { useClanMembers, EnrichedClanMember } from "@/components/clans/useClanMembers";
import { MemberProfilePreview } from "@/components/clans/MemberProfilePreview";

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
  daily_goal_minutes: number;
}

export default function Clans() {
  const navigate = useNavigate();
  const [allClans, setAllClans] = useState<Clan[]>([]);
  const [userClans, setUserClans] = useState<Clan[]>([]);
  const [selectedClan, setSelectedClan] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showDiscover, setShowDiscover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMember, setPreviewMember] = useState<EnrichedClanMember | null>(null);
  const { toast } = useToast();

  // Use the enriched clan members hook
  const { members, isLoading: membersLoading } = useClanMembers(selectedClan);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadClans();
      loadUserClans();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClan) {
      loadChallenges(selectedClan);
    }
  }, [selectedClan]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) {
      setIsLoading(false);
    }
  };

  const loadClans = async () => {
    const { data, error } = await supabase.from("clans").select(`
      id, name, description, clan_level, clan_xp, focus_tag, is_public, clan_streak, daily_goal_minutes, icon_emoji,
      clan_members(count)
    `);

    if (error) return;

    const formattedClans = data?.map(clan => ({
      id: clan.id,
      name: clan.name,
      description: clan.description || "",
      icon_emoji: clan.icon_emoji || "🔥",
      member_count: clan.clan_members?.[0]?.count || 0,
      avg_reduction: 0,
      clan_streak: clan.clan_streak || 0,
      clan_level: clan.clan_level || 1,
      clan_xp: clan.clan_xp || 0,
      is_public: clan.is_public !== false,
      daily_goal_minutes: clan.daily_goal_minutes || 120,
    })) || [];

    setAllClans(formattedClans);
  };

  const loadUserClans = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("clan_members")
      .select(`clan_id, clans(id, name, description, clan_level, clan_xp, focus_tag, is_public, clan_streak, daily_goal_minutes, icon_emoji, clan_members(count))`)
      .eq('user_id', user.id);

    if (error) {
      setIsLoading(false);
      return;
    }

    const formattedUserClans = data?.map(m => {
      const clan = m.clans as any;
      if (!clan) return null;
      return {
        id: clan.id,
        name: clan.name,
        description: clan.description || "",
        icon_emoji: clan.icon_emoji || "🔥",
        member_count: clan.clan_members?.[0]?.count || 0,
        avg_reduction: 0,
        clan_streak: clan.clan_streak || 0,
        clan_level: clan.clan_level || 1,
        clan_xp: clan.clan_xp || 0,
        is_public: clan.is_public !== false,
        daily_goal_minutes: clan.daily_goal_minutes || 120,
      };
    }).filter(Boolean) || [];

    setUserClans(formattedUserClans as Clan[]);
    setIsLoading(false);
  };

  const loadChallenges = async (clanId: string) => {
    const { data } = await supabase
      .from("clan_challenges")
      .select("*")
      .eq("clan_id", clanId);
    setChallenges(data || []);
  };

  // Transform enriched members to match ClanHub expected format
  const transformedMembers = members.map(m => ({
    user_id: m.user_id,
    username: m.username,
    avatar_type: m.avatar_type,
    avatar_level: m.avatar_level,
    avatar_xp: m.avatar_xp,
    avatar_energy: m.avatar_energy,
    daily_reduction: m.daily_reduction,
    weekly_avg: m.weekly_average,
    current_streak: m.current_streak,
    today_minutes: m.today_minutes,
    contribution: m.contribution,
    last_active: m.last_active,
  }));


  const createClan = async (name: string) => {
    if (!user) return;

    const { error } = await supabase.from("clans").insert({ 
      name, 
      created_by: user.id
    });

    if (error) {
      toast({ title: "Error creating clan", variant: "destructive" });
      return;
    }

    toast({ title: "Clan created!" });
    loadClans();
    loadUserClans();
    setShowDiscover(false);
  };

  const joinClan = async (clanId: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from("clan_members")
      .select("id")
      .eq("clan_id", clanId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      toast({ title: "Already a member" });
      return;
    }

    const { error } = await supabase.from("clan_members").insert({ clan_id: clanId, user_id: user.id });

    if (error) {
      toast({ title: "Error joining clan", variant: "destructive" });
      return;
    }

    toast({ title: "Joined clan!" });
    loadUserClans();
    loadClans();
    setShowDiscover(false);
  };

  const leaveClan = async (clanId: string) => {
    if (!user) return;

    await supabase.from("clan_members").delete().eq("clan_id", clanId).eq("user_id", user.id);
    toast({ title: "Left clan" });
    setSelectedClan(null);
    loadUserClans();
    loadClans();
  };

  const sendMessage = async (message: string) => {
    if (!user || !selectedClan) return;

    await supabase.from("clan_messages").insert({
      clan_id: selectedClan,
      user_id: user.id,
      message_type: 'user',
      content: message,
    });
  };

  const selectedClanData = userClans.find(c => c.id === selectedClan);

  // Render selected clan hub
  if (selectedClan && selectedClanData) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <ClanHub
            clanId={selectedClan}
            clanName={selectedClanData.name}
            clanDescription={selectedClanData.description}
            icon_emoji={selectedClanData.icon_emoji}
            clan_level={selectedClanData.clan_level}
            clan_xp={selectedClanData.clan_xp}
            clan_streak={selectedClanData.clan_streak}
            daily_goal_minutes={selectedClanData.daily_goal_minutes}
            members={transformedMembers}
            challenges={challenges}
            currentUserId={user?.id || ""}
            isLoading={membersLoading}
            onBack={() => setSelectedClan(null)}
            onLeave={() => leaveClan(selectedClan)}
            onSendMessage={sendMessage}
            onMemberClick={(member) => {
              const enrichedMember = members.find(m => m.user_id === member.user_id);
              if (enrichedMember) {
                setPreviewMember(enrichedMember);
              }
            }}
          />
          <MemberProfilePreview
            member={previewMember ? {
              ...previewMember,
              daily_reduction: previewMember.daily_reduction,
              weekly_avg: previewMember.weekly_average,
            } : null}
            isOpen={!!previewMember}
            onClose={() => setPreviewMember(null)}
          />
        </div>
      </div>
    );
  }

  // Render discover/create view
  if (showDiscover) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <DiscoverClans
            clans={allClans}
            userClanIds={userClans.map(c => c.id)}
            onBack={() => setShowDiscover(false)}
            onJoinClan={joinClan}
            onCreateClan={createClan}
          />
        </div>
      </div>
    );
  }

  // Show loading state while fetching user clans
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Main view - My Clans or Empty State
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back to Dashboard */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Better Buddy
        </Button>

        {userClans.length === 0 ? (
          <ClanEmptyState
            onJoinClick={() => setShowDiscover(true)}
            onCreateClick={() => setShowDiscover(true)}
            previewClans={allClans.slice(0, 3).map(c => ({
              id: c.id,
              name: c.name,
              member_count: c.member_count,
              icon_emoji: c.icon_emoji,
              clan_streak: c.clan_streak,
            }))}
            onPreviewClanJoin={joinClan}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">My Clans</h1>
              <Button onClick={() => setShowDiscover(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Join or Create
              </Button>
            </div>

            <div className="grid gap-4">
              {userClans.map(clan => (
                <ClanCard
                  key={clan.id}
                  {...clan}
                  isUserMember
                  onClick={() => setSelectedClan(clan.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}