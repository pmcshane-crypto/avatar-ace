import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Flame, Award, Calendar, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AvatarCard } from "@/components/AvatarCard";
import { Avatar, AvatarType } from "@/types/avatar";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const getXpToNextLevel = (level: number): number => {
  if (level === 1) return 100;
  if (level === 2) return 300;
  if (level === 3) return 500;
  return 500;
};

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<Avatar>({
    id: "1",
    type: "water",
    name: "Your Buddy",
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    energy: "medium",
    description: "",
  });
  const [profileStats, setProfileStats] = useState({
    bestStreak: 0,
    totalDaysActive: 0,
    lifetimeReduction: 0,
    currentStreak: 0,
  });
  const [weeklyData, setWeeklyData] = useState<{ day: string; minutes: number; baseline: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setUsername(profile.username);
        setAvatar({
          id: "1",
          type: profile.avatar_type as AvatarType,
          name: profile.username,
          level: profile.avatar_level,
          xp: profile.avatar_xp,
          xpToNextLevel: getXpToNextLevel(profile.avatar_level),
          energy: profile.avatar_energy as "high" | "medium" | "low",
          description: "",
        });
        setProfileStats({
          bestStreak: profile.best_streak,
          currentStreak: profile.current_streak,
          lifetimeReduction: Number(profile.total_reduction) || 0,
          totalDaysActive: 0,
        });
      }

      // Count total days active
      const { count } = await supabase
        .from("screen_time_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setProfileStats((prev) => ({ ...prev, totalDaysActive: count || 0 }));

      // Last 7 days
      const dates: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split("T")[0]);
      }

      const { data: entries } = await supabase
        .from("screen_time_entries")
        .select("date, total_minutes, music_minutes, better_buddy_minutes")
        .eq("user_id", user.id)
        .in("date", dates)
        .order("date");

      const baseline = profile?.baseline_minutes || 300;
      const mapped = dates.map((date) => {
        const entry = entries?.find((e) => e.date === date);
        const actual = entry
          ? entry.total_minutes - (entry.music_minutes || 0) - (entry.better_buddy_minutes || 0)
          : 0;
        const dayLabel = new Date(date + "T12:00:00").toLocaleDateString("en", { weekday: "short" });
        return { day: dayLabel, minutes: entry ? actual : 0, baseline };
      });

      setWeeklyData(mapped);
    };

    load();
  }, [navigate]);

  const handleSaveUsername = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("profiles").update({ username }).eq("id", user.id);
    setIsEditing(false);
    toast({ title: "Username updated! ✅" });
  };

  const statItems = [
    { icon: Flame, label: "Current Streak", value: `${profileStats.currentStreak} days`, color: "text-warning" },
    { icon: Award, label: "Best Streak", value: `${profileStats.bestStreak} days`, color: "text-primary" },
    { icon: Calendar, label: "Days Active", value: `${profileStats.totalDaysActive}`, color: "text-accent" },
    { icon: TrendingDown, label: "Lifetime Reduction", value: `${profileStats.lifetimeReduction}%`, color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        </div>

        {/* Username */}
        <Card className="p-5 bg-gradient-card border-border/50">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-secondary border-border text-foreground flex-1"
                />
                <Button size="sm" onClick={handleSaveUsername}>
                  <Save className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold text-foreground flex-1">{username}</span>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Avatar preview */}
        <div className="bg-black rounded-3xl p-6">
          <AvatarCard avatar={avatar} size="lg" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((item) => (
            <Card key={item.label} className="p-4 bg-gradient-card border-border/50 text-center space-y-1">
              <item.icon className={`w-5 h-5 mx-auto ${item.color}`} />
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            </Card>
          ))}
        </div>

        {/* 7-day chart */}
        <Card className="p-5 bg-gradient-card border-border/50 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Last 7 Days</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="20%">
                <XAxis dataKey="day" tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.minutes === 0
                          ? "hsl(220 20% 20%)"
                          : entry.minutes < entry.baseline
                          ? "hsl(142 76% 45%)"
                          : "hsl(0 84% 60%)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block" /> Under baseline</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block" /> Over baseline</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
