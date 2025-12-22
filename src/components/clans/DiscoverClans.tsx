import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, ArrowLeft, Sparkles } from "lucide-react";
import { ClanCard } from "./ClanCard";

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
  focus_tag: string;
  is_public: boolean;
}

interface DiscoverClansProps {
  clans: Clan[];
  userClanIds: string[];
  onBack: () => void;
  onJoinClan: (clanId: string) => void;
  onCreateClan: (name: string, focusTag: string) => void;
}

const FOCUS_TAGS = ['All-Around', 'Focus', 'Social Media', 'Gaming'];

export function DiscoverClans({
  clans,
  userClanIds,
  onBack,
  onJoinClan,
  onCreateClan,
}: DiscoverClansProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [newClanName, setNewClanName] = useState("");
  const [newClanTag, setNewClanTag] = useState("All-Around");
  const [activeTab, setActiveTab] = useState("discover");

  const filteredClans = clans.filter(clan => {
    const matchesSearch = clan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || clan.focus_tag === selectedTag;
    const notJoined = !userClanIds.includes(clan.id);
    return matchesSearch && matchesTag && notJoined;
  });

  const trendingClans = [...clans]
    .filter(c => !userClanIds.includes(c.id))
    .sort((a, b) => b.clan_streak - a.clan_streak)
    .slice(0, 3);

  const handleCreateClan = () => {
    if (!newClanName.trim()) return;
    onCreateClan(newClanName.trim(), newClanTag);
    setNewClanName("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Join or Create Clan</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 bg-card/50">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6 mt-6">
          {/* Trending Section */}
          {trendingClans.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warning" />
                Trending Clans
              </h2>
              <div className="grid gap-3">
                {trendingClans.map(clan => (
                  <ClanCard
                    key={clan.id}
                    {...clan}
                    onJoin={() => onJoinClan(clan.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <Card className="bg-card/50">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={selectedTag === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(null)}
                >
                  All
                </Badge>
                {FOCUS_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Clans */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">All Clans</h2>
            {filteredClans.length === 0 ? (
              <Card className="bg-card/50 border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>No clans found</p>
                  <p className="text-sm mt-1">Try a different search or create your own!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {filteredClans.map(clan => (
                  <ClanCard
                    key={clan.id}
                    {...clan}
                    onJoin={() => onJoinClan(clan.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Your Clan
              </CardTitle>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Focus Area</label>
                <div className="grid grid-cols-2 gap-2">
                  {FOCUS_TAGS.map(tag => (
                    <Button
                      key={tag}
                      variant={newClanTag === tag ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setNewClanTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCreateClan}
                disabled={!newClanName.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Clan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}