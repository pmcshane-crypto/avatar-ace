import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, TrendingDown, Flame, Users, Plus, Search, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import clansBackground from "@/assets/clans-background.png";
interface ClanMember {
  user_id: string;
  username: string;
  avatar_type: string;
  daily_reduction: number;
  weekly_avg: number;
  current_streak: number;
  level: number;
  xp: number;
}

interface ClanPreview {
  user_id: string;
  username: string;
  avatar_type: string;
  level: number;
}

interface Clan {
  id: string;
  name: string;
  description: string;
  member_count: number;
  preview_members: ClanPreview[];
}

export default function Clans() {
  const navigate = useNavigate();
  const [allClans, setAllClans] = useState<Clan[]>([]);
  const [userClans, setUserClans] = useState<Clan[]>([]);
  const [selectedClan, setSelectedClan] = useState<string | null>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [newClanName, setNewClanName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showJoinCreate, setShowJoinCreate] = useState(false);
  const { toast } = useToast();

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
      loadClanMembers(selectedClan);
    }
  }, [selectedClan]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadClans = async () => {
    const { data, error } = await supabase
      .from("clans")
      .select(`
        id,
        name,
        description,
        clan_members(
          count,
          user_id,
          profiles(username, avatar_type)
        )
      `);

    if (error) {
      console.error("Error loading clans:", error);
      return;
    }

    const formattedClans = data?.map(clan => {
      const members = clan.clan_members || [];
      const memberCount = members.length;
      
      // Get up to 5 members for preview
      const previewMembers = members
        .filter((m: any) => m.profiles)
        .slice(0, 5)
        .map((m: any) => {
          // Calculate level from localStorage or default
          const savedAvatar = localStorage.getItem('avatar');
          let level = 1;
          if (savedAvatar) {
            try {
              const avatarData = JSON.parse(savedAvatar);
              level = avatarData.level || 1;
            } catch (e) {
              level = 1;
            }
          }
          
          return {
            user_id: m.user_id,
            username: m.profiles.username,
            avatar_type: m.profiles.avatar_type,
            level: level
          };
        });

      return {
        id: clan.id,
        name: clan.name,
        description: clan.description || "",
        member_count: memberCount,
        preview_members: previewMembers
      };
    }) || [];

    setAllClans(formattedClans);
  };

  const loadUserClans = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("clan_members")
      .select(`
        clan_id,
        clans(
          id,
          name,
          description,
          clan_members(
            count,
            user_id,
            profiles(username, avatar_type, baseline_minutes),
            screen_time_entries(date, actual_minutes)
          )
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error("Error loading user clans:", error);
      return;
    }

    const formattedUserClans = data?.map(membership => {
      const clan = membership.clans;
      if (!clan) return null;

      const members = clan.clan_members || [];
      const memberCount = members.length;

      // Calculate clan average improvement
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      let totalImprovement = 0;
      let memberWithData = 0;

      members.forEach((m: any) => {
        if (!m.profiles) return;
        const baseline = m.profiles.baseline_minutes;
        const weeklyEntries = m.screen_time_entries?.filter((e: any) => e.date >= weekAgo) || [];
        
        if (weeklyEntries.length > 0 && baseline > 0) {
          const avgActual = weeklyEntries.reduce((sum: number, e: any) => sum + (e.actual_minutes || 0), 0) / weeklyEntries.length;
          const improvement = ((baseline - avgActual) / baseline) * 100;
          totalImprovement += improvement;
          memberWithData++;
        }
      });

      const avgImprovement = memberWithData > 0 ? totalImprovement / memberWithData : 0;

      const previewMembers = members
        .filter((m: any) => m.profiles)
        .slice(0, 5)
        .map((m: any) => ({
          user_id: m.user_id,
          username: m.profiles.username,
          avatar_type: m.profiles.avatar_type,
          level: 1
        }));

      return {
        id: clan.id,
        name: clan.name,
        description: clan.description || "",
        member_count: memberCount,
        preview_members: previewMembers,
        avg_improvement: avgImprovement
      };
    }).filter(Boolean) || [];

    setUserClans(formattedUserClans as any);
  };

  const loadClanMembers = async (clanId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from("clan_members")
      .select(`
        user_id,
        profiles!inner(username, avatar_type, baseline_minutes),
        screen_time_entries(date, actual_minutes)
      `)
      .eq("clan_id", clanId);

    if (error) {
      console.error("Error loading members:", error);
      return;
    }

    const membersData = data?.map((member: any) => {
      const profile = member.profiles;
      const entries = member.screen_time_entries || [];
      
      const todayEntry = entries.find((e: any) => e.date === today);
      const weekEntries = entries.filter((e: any) => e.date >= weekAgo && e.date <= today);
      
      const dailyReduction = todayEntry
        ? ((profile.baseline_minutes - todayEntry.actual_minutes) / profile.baseline_minutes) * 100
        : 0;
      
      const weeklyAvg = weekEntries.length > 0
        ? weekEntries.reduce((sum: number, e: any) => sum + e.actual_minutes, 0) / weekEntries.length
        : profile.baseline_minutes;

      let currentStreak = 0;
      const sortedEntries = [...entries].sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      for (const entry of sortedEntries) {
        if (entry.actual_minutes < profile.baseline_minutes) {
          currentStreak++;
        } else {
          break;
        }
      }

      return {
        user_id: member.user_id,
        username: profile.username,
        avatar_type: profile.avatar_type,
        daily_reduction: Math.round(dailyReduction),
        weekly_avg: Math.round(weeklyAvg),
        current_streak: currentStreak,
        level: 1,  // Will be calculated from screen time data
        xp: 0
      };
    }) || [];

    setMembers(membersData.sort((a, b) => b.daily_reduction - a.daily_reduction));
  };

  const createClan = async () => {
    if (!user) {
      toast({ title: "Please sign in to create a clan" });
      return;
    }

    if (!newClanName.trim()) {
      toast({ title: "Please enter a clan name" });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      toast({ title: "Please complete your profile first" });
      return;
    }

    const { error } = await supabase
      .from("clans")
      .insert({ 
        name: newClanName, 
        created_by: user.id 
      });

    if (error) {
      toast({ title: "Error creating clan", description: error.message });
      return;
    }

    toast({ title: "Clan created successfully!" });
    setNewClanName("");
    loadClans();
  };

  const joinClan = async (clanId: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You must be logged in to join a clan",
        variant: "destructive",
      });
      return;
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from("clan_members")
      .select("id")
      .eq("clan_id", clanId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      toast({
        title: "Already a member",
        description: "You're already part of this clan",
      });
      return;
    }

    const { error } = await supabase
      .from("clan_members")
      .insert({
        clan_id: clanId,
        user_id: user.id
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to join clan",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success!",
      description: "You've joined the clan!",
    });
    
    loadUserClans();
    loadClans();
    setShowJoinCreate(false);
  };

  const leaveClan = async (clanId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("clan_members")
      .delete()
      .eq("clan_id", clanId)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to leave clan",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Left clan",
      description: "You've left the clan",
    });

    setSelectedClan(null);
    loadUserClans();
    loadClans();
  };

  const filteredClans = allClans.filter(clan => 
    clan.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !userClans.some(uc => uc.id === clan.id)
  );

  const dailyWinner = members.length > 0 ? members[0] : null;
  const weeklyWinner = members.length > 0 
    ? [...members].sort((a, b) => a.weekly_avg - b.weekly_avg)[0] 
    : null;

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${clansBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Gradient overlay for blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/70 to-background/95" />
      
      <div className="relative z-10 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (selectedClan) {
                  setSelectedClan(null);
                } else if (showJoinCreate) {
                  setShowJoinCreate(false);
                } else {
                  navigate("/dashboard");
                }
              }}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {selectedClan ? "Clan Hub" : showJoinCreate ? "Join or Create Clan" : "My Clans"}
            </h1>
          </div>
        </div>

        {selectedClan ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    Daily Winner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyWinner ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{dailyWinner.username}</span>
                        <Badge className="bg-warning/20 text-warning border-warning/50">
                          {dailyWinner.avatar_type}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-success">
                        {dailyWinner.daily_reduction}% reduction
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-success" />
                    Weekly Winner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyWinner ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{weeklyWinner.username}</span>
                        <Badge className="bg-accent/20 text-accent border-accent/50">
                          {weeklyWinner.avatar_type}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-success">
                        {Math.floor(weeklyWinner.weekly_avg / 60)}h {weeklyWinner.weekly_avg % 60}m avg
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Avatar</TableHead>
                      <TableHead>Daily %</TableHead>
                      <TableHead>Weekly Avg</TableHead>
                      <TableHead>Streak</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member, index) => (
                      <TableRow key={member.user_id}>
                        <TableCell>
                          {index === 0 && <Trophy className="w-4 h-4 text-warning inline mr-2" />}
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{member.username}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.avatar_type}</Badge>
                        </TableCell>
                        <TableCell className="text-success font-bold">
                          {member.daily_reduction}%
                        </TableCell>
                        <TableCell>
                          {Math.floor(member.weekly_avg / 60)}h {member.weekly_avg % 60}m
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-warning" />
                            {member.current_streak}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Button
              onClick={() => leaveClan(selectedClan)}
              variant="destructive"
              className="w-full"
            >
              Leave Clan
            </Button>
          </div>
        ) : showJoinCreate ? (
          <div className="space-y-6">
            {/* Create New Clan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Clan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter clan name..."
                    value={newClanName}
                    onChange={(e) => setNewClanName(e.target.value)}
                  />
                  <Button onClick={createClan}>
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Clans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search clans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Available Clans List */}
            <div className="grid gap-4">
              {filteredClans.map(clan => (
                <Card key={clan.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{clan.name}</span>
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        {clan.member_count}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {clan.member_count} members
                        </span>
                      </div>

                      {clan.preview_members.length > 0 && (
                        <div className="flex -space-x-2">
                          {clan.preview_members.map((member, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs"
                            >
                              {member.username[0]}
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        onClick={() => joinClan(clan.id)}
                        className="w-full"
                      >
                        Join Clan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User's Clans */}
            <div className="space-y-4">
              {userClans.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground mb-4">You haven't joined any clans yet</p>
                    <Button onClick={() => setShowJoinCreate(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Join or Create Clan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Your Clans</h2>
                    <Button onClick={() => setShowJoinCreate(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Join or Create
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {userClans.map(clan => (
                      <Card key={clan.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedClan(clan.id)}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{clan.name}</span>
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              {clan.member_count}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {clan.description && (
                              <p className="text-sm text-muted-foreground">{clan.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">
                                  {(clan as any).avg_improvement?.toFixed(1) || 0}% avg improvement
                                </span>
                              </div>
                            </div>

                            {clan.preview_members.length > 0 && (
                              <div className="flex -space-x-2">
                                {clan.preview_members.map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-semibold"
                                  >
                                    {member.username[0].toUpperCase()}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
