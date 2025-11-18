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
  const [clans, setClans] = useState<Clan[]>([]);
  const [selectedClan, setSelectedClan] = useState<string | null>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [newClanName, setNewClanName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    loadClans();
  }, []);

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

    setClans(formattedClans);
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
      toast({ title: "Please sign in to join a clan" });
      return;
    }

    const { error } = await supabase
      .from("clan_members")
      .insert({ 
        clan_id: clanId, 
        user_id: user.id 
      });

    if (error) {
      toast({ title: "Error joining clan", description: error.message });
      return;
    }

    toast({ title: "Successfully joined clan!" });
    loadClans();
  };

  const filteredClans = clans.filter(clan =>
    clan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dailyWinner = members.length > 0 ? members[0] : null;
  const weeklyWinner = members.length > 0 
    ? [...members].sort((a, b) => a.weekly_avg - b.weekly_avg)[0] 
    : null;

  return (
    <div className="min-h-screen bg-gradient-radial from-background via-background to-primary/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            size="icon"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center flex-1 space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Clans
            </h1>
            <p className="text-muted-foreground">
              Join clans to compete with friends and track progress together
            </p>
          </div>
        </div>

        {selectedClan && (
          <>
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
              onClick={() => setSelectedClan(null)}
              variant="outline"
              className="w-full"
            >
              Back to Clans
            </Button>
          </>
        )}

        {!selectedClan && (
          <>
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Create New Clan</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Input
                  placeholder="Clan name..."
                  value={newClanName}
                  onChange={(e) => setNewClanName(e.target.value)}
                />
                <Button onClick={createClan}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </CardContent>
            </Card>

            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredClans.map((clan) => (
                <Card key={clan.id} className="bg-gradient-card border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{clan.name}</span>
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        {clan.member_count}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {clan.description || "No description"}
                    </p>
                    
                    {/* Member Avatars Preview */}
                    {clan.preview_members.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground font-medium">Members:</div>
                        <div className="flex flex-wrap gap-2">
                          {clan.preview_members.map((member) => (
                            <div 
                              key={member.user_id}
                              className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2 border border-border/50"
                            >
                              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                member.avatar_type === 'fire' 
                                  ? 'border-avatar-fire bg-avatar-fire/20 text-avatar-fire' 
                                  : member.avatar_type === 'water'
                                  ? 'border-avatar-water bg-avatar-water/20 text-avatar-water'
                                  : 'border-avatar-nature bg-avatar-nature/20 text-avatar-nature'
                              }`}>
                                {member.avatar_type === 'fire' ? '🔥' : member.avatar_type === 'water' ? '💧' : '🌿'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium">{member.username}</span>
                                <span className="text-[10px] text-muted-foreground">Lvl {member.level}</span>
                              </div>
                            </div>
                          ))}
                          {clan.member_count > 5 && (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-bold">
                              +{clan.member_count - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setSelectedClan(clan.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button 
                        onClick={() => joinClan(clan.id)}
                        className="flex-1"
                      >
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
