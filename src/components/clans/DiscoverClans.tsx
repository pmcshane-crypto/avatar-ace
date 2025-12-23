import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, ArrowLeft, Sparkles, Rocket } from "lucide-react";
import { ClanCard } from "./ClanCard";
import { FeaturedClans } from "./FeaturedClans";
import { ClanFilters, ClanFilter } from "./ClanFilters";
import { SocialProofBanner } from "./SocialProofBanner";

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
}

interface DiscoverClansProps {
  clans: Clan[];
  userClanIds: string[];
  onBack: () => void;
  onJoinClan: (clanId: string) => void;
  onCreateClan: (name: string) => void;
}

export function DiscoverClans({
  clans,
  userClanIds,
  onBack,
  onJoinClan,
  onCreateClan,
}: DiscoverClansProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newClanName, setNewClanName] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const [activeFilter, setActiveFilter] = useState<ClanFilter>("all");

  const availableClans = clans.filter(c => !userClanIds.includes(c.id));

  const filteredClans = useMemo(() => {
    let result = availableClans.filter(clan => 
      clan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (activeFilter) {
      case 'most-active':
        return result.sort((a, b) => b.clan_streak - a.clan_streak);
      case 'lowest-screen-time':
        return result.sort((a, b) => b.avg_reduction - a.avg_reduction);
      case 'new':
        return result.sort((a, b) => a.clan_level - b.clan_level);
      default:
        return result;
    }
  }, [availableClans, searchTerm, activeFilter]);

  const featuredClans = availableClans
    .sort((a, b) => (b.clan_streak + b.avg_reduction) - (a.clan_streak + a.avg_reduction))
    .slice(0, 5);

  const totalUsers = clans.reduce((sum, c) => sum + c.member_count, 0);
  const totalReduction = clans.reduce((sum, c) => sum + c.avg_reduction, 0);

  const handleCreateClan = () => {
    if (!newClanName.trim()) return;
    onCreateClan(newClanName.trim());
    setNewClanName("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Discover Clans</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 bg-card/50">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6 mt-6">
          {/* Social Proof */}
          <SocialProofBanner totalUsers={totalUsers} totalReduction={totalReduction} />

          {/* Featured Section */}
          {featuredClans.length > 0 && (
            <FeaturedClans clans={featuredClans} onJoinClan={onJoinClan} />
          )}

          {/* Search & Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <ClanFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* All Clans */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">All Clans ({filteredClans.length})</h2>
            {filteredClans.length === 0 ? (
              <Card className="bg-card/50 border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>No clans found</p>
                  <p className="text-sm mt-1">Try a different search or create your own!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {filteredClans.map((clan, i) => (
                  <motion.div
                    key={clan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ClanCard {...clan} onJoin={() => onJoinClan(clan.id)} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6 mt-6">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Create Your Clan
              </CardTitle>
              <p className="text-sm text-muted-foreground">Set the culture. Lead the streak.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Clan Name</label>
                <Input
                  placeholder="Enter clan name..."
                  value={newClanName}
                  onChange={(e) => setNewClanName(e.target.value)}
                />
              </div>
              <Button 
                className="w-full gap-2 shadow-lg shadow-primary/25" 
                size="lg"
                onClick={handleCreateClan}
                disabled={!newClanName.trim()}
              >
                <Sparkles className="w-4 h-4" />
                Create Clan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}