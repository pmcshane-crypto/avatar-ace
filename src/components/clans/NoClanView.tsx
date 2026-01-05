import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Sparkles, ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clan } from '@/types/clan';

interface NoClanViewProps {
  userId: string | null;
  onJoinClan: () => void;
}

export function NoClanView({ userId, onJoinClan }: NoClanViewProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [publicClans, setPublicClans] = useState<Clan[]>([]);
  
  const [newClan, setNewClan] = useState({
    name: '',
    description: '',
    icon_emoji: '🔥',
    daily_goal_minutes: 120,
  });

  const loadPublicClans = async () => {
    const { data } = await supabase
      .from('clans')
      .select('*')
      .eq('is_public', true)
      .limit(10);
    
    if (data) {
      setPublicClans(data as Clan[]);
    }
    setShowJoin(true);
  };

  const handleCreateClan = async () => {
    if (!userId || !newClan.name.trim()) {
      toast({ title: 'Please enter a clan name', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      // Create clan
      const { data: clanData, error: clanError } = await supabase
        .from('clans')
        .insert({
          name: newClan.name.trim(),
          description: newClan.description.trim() || null,
          icon_emoji: newClan.icon_emoji,
          daily_goal_minutes: newClan.daily_goal_minutes,
          created_by: userId,
        })
        .select()
        .single();

      if (clanError) throw clanError;

      // Join clan as member
      const { error: memberError } = await supabase
        .from('clan_members')
        .insert({
          clan_id: clanData.id,
          user_id: userId,
        });

      if (memberError) throw memberError;

      toast({ title: 'Clan created! 🎉' });
      onJoinClan();
    } catch (error: any) {
      toast({ title: 'Error creating clan', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClan = async (clanId: string) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('clan_members')
        .insert({
          clan_id: clanId,
          user_id: userId,
        });

      if (error) throw error;

      toast({ title: 'Joined clan! 🎉' });
      onJoinClan();
    } catch (error: any) {
      toast({ title: 'Error joining clan', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const emojiOptions = ['🔥', '⚡', '🌟', '🎯', '💪', '🚀', '🌈', '🎮', '📱', '🧘'];

  return (
    <div className="min-h-screen bg-gradient-radial from-background via-background to-primary/5 p-6">
      <div className="max-w-lg mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground">Join a Clan</h1>
          <p className="text-muted-foreground">Team up to reduce screen time together</p>
        </motion.div>

        {!showCreate && !showJoin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <Card 
              className="p-6 cursor-pointer hover:border-primary/50 transition-all group"
              onClick={() => setShowCreate(true)}
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 rounded-full p-3 group-hover:bg-primary/30 transition-colors">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Create a Clan</h3>
                  <p className="text-sm text-muted-foreground">Start your own and invite friends</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:border-primary/50 transition-all group"
              onClick={loadPublicClans}
            >
              <div className="flex items-center gap-4">
                <div className="bg-accent/20 rounded-full p-3 group-hover:bg-accent/30 transition-colors">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Join a Clan</h3>
                  <p className="text-sm text-muted-foreground">Find a public clan to join</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
            </Card>
          </motion.div>
        )}

        {showCreate && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="p-6 space-y-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCreate(false)}
                className="mb-2"
              >
                ← Back
              </Button>

              <div className="space-y-2">
                <Label>Clan Name</Label>
                <Input
                  placeholder="Enter clan name"
                  value={newClan.name}
                  onChange={(e) => setNewClan({ ...newClan, name: e.target.value })}
                  maxLength={30}
                />
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="What's your clan about?"
                  value={newClan.description}
                  onChange={(e) => setNewClan({ ...newClan, description: e.target.value })}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setNewClan({ ...newClan, icon_emoji: emoji })}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        newClan.icon_emoji === emoji 
                          ? 'bg-primary/30 border-2 border-primary' 
                          : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Daily Goal (minutes per member)</Label>
                <Input
                  type="number"
                  value={newClan.daily_goal_minutes}
                  onChange={(e) => setNewClan({ ...newClan, daily_goal_minutes: parseInt(e.target.value) || 120 })}
                  min={30}
                  max={480}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleCreateClan}
                disabled={isLoading || !newClan.name.trim()}
              >
                {isLoading ? 'Creating...' : 'Create Clan'}
              </Button>
            </Card>
          </motion.div>
        )}

        {showJoin && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowJoin(false)}
            >
              ← Back
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search clans..." className="pl-10" />
            </div>

            <div className="space-y-3">
              {publicClans.map(clan => (
                <Card key={clan.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{clan.icon_emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{clan.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {clan.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>🔥 {clan.clan_streak} streak</span>
                        <span>•</span>
                        <span>Level {clan.clan_level}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleJoinClan(clan.id)}
                      disabled={isLoading}
                    >
                      Join
                    </Button>
                  </div>
                </Card>
              ))}

              {publicClans.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No public clans found</p>
                  <p className="text-sm">Be the first to create one!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="w-full"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
