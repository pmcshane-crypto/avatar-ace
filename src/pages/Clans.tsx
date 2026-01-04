import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ClanEmptyState, ClanCard, ClanHub, DiscoverClans } from "@/components/clans";

// Import all avatar images
import avatarFire from "@/assets/avatar-fire.png";
import avatarFireLevel2 from "@/assets/avatar-fire-level2.png";
import avatarFireLevel3 from "@/assets/avatar-fire-level3.png";
import avatarWater from "@/assets/avatar-water.png";
import avatarWaterLevel2 from "@/assets/avatar-water-level2.png";
import avatarWaterLevel3 from "@/assets/avatar-water-level3.png";
import avatarNature from "@/assets/avatar-nature.png";
import avatarNatureLevel2 from "@/assets/avatar-nature-level2.png";
import avatarNatureLevel3 from "@/assets/avatar-nature-level3.png";
import avatarChungloid from "@/assets/avatar-chungloid.png";
import avatarChungloidLevel2 from "@/assets/avatar-chungloid-level2.png";
import avatarChungloidLevel3 from "@/assets/avatar-chungloid-level3.png";
import avatarChickenNugget from "@/assets/avatar-chicken-nugget.png";
import avatarChickenNuggetLevel2 from "@/assets/avatar-chicken-nugget-level2.png";
import avatarChickenNuggetLevel3 from "@/assets/avatar-chicken-nugget-level3.png";
import avatarFlarion from "@/assets/avatar-flarion.png";
import avatarFlarionLevel2 from "@/assets/avatar-flarion-level2.png";
import avatarFlarionLevel3 from "@/assets/avatar-flarion-level3.png";
import avatarAuarlis from "@/assets/avatar-auarlis.png";
import avatarAuarlisLevel2 from "@/assets/avatar-auarlis-level2.png";
import avatarAuarlisLevel3 from "@/assets/avatar-auarlis-level3.png";
import avatarTeddy from "@/assets/avatar-teddy.png";
import avatarTeddyLevel2 from "@/assets/avatar-teddy-level2.png";
import avatarTeddyLevel3 from "@/assets/avatar-teddy-level3.png";

// Avatar image mapping by type and level
const AVATAR_IMAGES: Record<string, Record<number, string>> = {
  fire: { 1: avatarFire, 2: avatarFireLevel2, 3: avatarFireLevel3 },
  water: { 1: avatarWater, 2: avatarWaterLevel2, 3: avatarWaterLevel3 },
  nature: { 1: avatarNature, 2: avatarNatureLevel2, 3: avatarNatureLevel3 },
  chungloid: { 1: avatarChungloid, 2: avatarChungloidLevel2, 3: avatarChungloidLevel3 },
  'chicken-nugget': { 1: avatarChickenNugget, 2: avatarChickenNuggetLevel2, 3: avatarChickenNuggetLevel3 },
  flarion: { 1: avatarFlarion, 2: avatarFlarionLevel2, 3: avatarFlarionLevel3 },
  auarlis: { 1: avatarAuarlis, 2: avatarAuarlisLevel2, 3: avatarAuarlisLevel3 },
  teddy: { 1: avatarTeddy, 2: avatarTeddyLevel2, 3: avatarTeddyLevel3 },
};

const getAvatarImage = (type: string, level: number = 1): string => {
  const normalizedType = type?.toLowerCase() || 'nature';
  const avatarSet = AVATAR_IMAGES[normalizedType];
  if (!avatarSet) return avatarNature;
  const clampedLevel = Math.max(1, Math.min(3, level));
  return avatarSet[clampedLevel] || avatarSet[1];
};

const getGlowColor = (type: string): string => {
  switch (type?.toLowerCase()) {
    case 'fire': return 'bg-orange-500/50';
    case 'water': return 'bg-blue-500/50';
    case 'nature': return 'bg-green-500/50';
    case 'chungloid': return 'bg-purple-500/50';
    case 'chicken-nugget': return 'bg-amber-500/50';
    case 'flarion': return 'bg-violet-500/50';
    case 'auarlis': return 'bg-sky-400/50';
    case 'teddy': return 'bg-amber-600/50';
    default: return 'bg-primary/30';
  }
};

interface ClanMember {
  user_id: string;
  username: string;
  avatar_type: string;
  avatar_level: number;
  daily_reduction: number;
  weekly_avg: number;
  current_streak: number;
  today_minutes?: number;
  contribution: number;
  last_active?: string;
}

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

interface UserProfile {
  avatar_type: string;
  avatar_level: number;
  username: string;
}

export default function Clans() {
  const navigate = useNavigate();
  const [allClans, setAllClans] = useState<Clan[]>([]);
  const [userClans, setUserClans] = useState<Clan[]>([]);
  const [selectedClan, setSelectedClan] = useState<string | null>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showDiscover, setShowDiscover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadClans();
      loadUserClans();
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClan) {
      loadClanMembers(selectedClan);
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

  const loadUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("avatar_type, avatar_level, username")
      .eq("id", user.id)
      .single();
    if (data) {
      setUserProfile(data);
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

  const loadClanMembers = async (clanId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data } = await supabase
      .from("clan_members")
      .select(`user_id, profiles!inner(username, avatar_type, avatar_level, baseline_minutes)`)
      .eq("clan_id", clanId);

    const membersData = data?.map((member: any) => {
      const profile = member.profiles;
      return {
        user_id: member.user_id,
        username: profile.username,
        avatar_type: profile.avatar_type,
        avatar_level: profile.avatar_level || 1,
        daily_reduction: Math.floor(Math.random() * 30),
        weekly_avg: profile.baseline_minutes - Math.floor(Math.random() * 60),
        current_streak: Math.floor(Math.random() * 10),
        today_minutes: profile.baseline_minutes - Math.floor(Math.random() * 60),
        contribution: Math.floor(Math.random() * 200),
      };
    }) || [];

    setMembers(membersData.sort((a, b) => b.daily_reduction - a.daily_reduction));
  };

  const loadChallenges = async (clanId: string) => {
    const { data } = await supabase
      .from("clan_challenges")
      .select("*")
      .eq("clan_id", clanId);
    setChallenges(data || []);
  };

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
            members={members}
            challenges={challenges}
            currentUserId={user?.id || ""}
            onBack={() => setSelectedClan(null)}
            onLeave={() => leaveClan(selectedClan)}
            onSendMessage={sendMessage}
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
        {/* User's Better Buddy Display */}
        {userProfile && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-card to-card/80 border border-border/50">
            <div className="relative">
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-full blur-lg opacity-70 ${getGlowColor(userProfile.avatar_type)}`} />
              <div className="relative w-16 h-16 rounded-full bg-black border-2 border-primary/50 overflow-hidden shadow-lg">
                <img 
                  src={getAvatarImage(userProfile.avatar_type, userProfile.avatar_level)} 
                  alt="Your Better Buddy"
                  className="w-full h-full object-contain scale-90"
                />
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground border-2 border-background shadow-md">
                {userProfile.avatar_level}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Your Better Buddy</p>
              <p className="text-lg font-bold capitalize">{userProfile.avatar_type.replace('-', ' ')}</p>
              <p className="text-sm text-primary">Level {userProfile.avatar_level} • {userProfile.username}</p>
            </div>
          </div>
        )}

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