import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Hash, Users, AlertTriangle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clan } from '@/types/clan';

interface SwitchClanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentClanId?: string;
  onSwitch: () => void;
}

export function SwitchClanModal({ isOpen, onClose, userId, currentClanId, onSwitch }: SwitchClanModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [publicClans, setPublicClans] = useState<Clan[]>([]);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const [newClan, setNewClan] = useState({ name: '', description: '', icon_emoji: '🔥', daily_goal_minutes: 120 });

  const emojiOptions = ['🔥', '⚡', '🌟', '🎯', '💪', '🚀', '🌈', '🎮', '📱', '🧘'];

  const loadPublicClans = async () => {
    const { data } = await supabase
      .from('clans')
      .select('*')
      .eq('is_public', true)
      .limit(20);
    if (data) setPublicClans(data as Clan[]);
    setSearchLoaded(true);
  };

  const switchToClan = async (clanId: string) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      // Leave current clan
      if (currentClanId) {
        await supabase.from('clan_members').delete().eq('user_id', userId).eq('clan_id', currentClanId);
      }
      // Join new clan
      const { error } = await supabase.from('clan_members').insert({ clan_id: clanId, user_id: userId });
      if (error) throw error;
      toast({ title: 'Switched clan! 🎉' });
      onSwitch();
      onClose();
    } catch (error: any) {
      toast({ title: 'Error switching clan', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setIsLoading(true);
    try {
      // Treat code as clan ID prefix or name match
      const { data } = await supabase
        .from('clans')
        .select('*')
        .or(`id.eq.${joinCode.trim()},name.ilike.%${joinCode.trim()}%`)
        .limit(1)
        .single();
      if (!data) {
        toast({ title: 'Clan not found', description: 'Check the code and try again.', variant: 'destructive' });
        return;
      }
      await switchToClan(data.id);
    } catch {
      toast({ title: 'Clan not found', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClan = async () => {
    if (!userId || !newClan.name.trim()) return;
    setIsLoading(true);
    try {
      if (currentClanId) {
        await supabase.from('clan_members').delete().eq('user_id', userId).eq('clan_id', currentClanId);
      }
      const { data: clanData, error: clanError } = await supabase
        .from('clans')
        .insert({ name: newClan.name.trim(), description: newClan.description.trim() || null, icon_emoji: newClan.icon_emoji, daily_goal_minutes: newClan.daily_goal_minutes, created_by: userId })
        .select()
        .single();
      if (clanError) throw clanError;
      const { error: memberError } = await supabase.from('clan_members').insert({ clan_id: clanData.id, user_id: userId });
      if (memberError) throw memberError;
      toast({ title: 'New clan created! 🎉' });
      onSwitch();
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Switch Clan</DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-amber-400 text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            Joining a new clan will automatically leave your current one
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="code" className="mt-2" onValueChange={(v) => { if (v === 'browse' && !searchLoaded) loadPublicClans(); }}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="code"><Hash className="w-3.5 h-3.5 mr-1" />Code</TabsTrigger>
            <TabsTrigger value="browse"><Search className="w-3.5 h-3.5 mr-1" />Browse</TabsTrigger>
            <TabsTrigger value="create"><Plus className="w-3.5 h-3.5 mr-1" />Create</TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Clan Code or Name</Label>
              <Input placeholder="Enter clan code..." value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleJoinByCode} disabled={isLoading || !joinCode.trim()}>
              {isLoading ? 'Joining...' : 'Join Clan'}
            </Button>
          </TabsContent>

          <TabsContent value="browse" className="space-y-3 mt-4">
            {publicClans.map(clan => (
              <Card key={clan.id} className="p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{clan.icon_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">{clan.name}</h4>
                    <p className="text-xs text-muted-foreground">🔥 {clan.clan_streak} streak · Lv {clan.clan_level}</p>
                  </div>
                  <Button size="sm" onClick={() => switchToClan(clan.id)} disabled={isLoading || clan.id === currentClanId}>
                    {clan.id === currentClanId ? 'Current' : 'Join'}
                  </Button>
                </div>
              </Card>
            ))}
            {publicClans.length === 0 && searchLoaded && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No public clans found
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label>Clan Name</Label>
              <Input placeholder="Name your clan" value={newClan.name} onChange={(e) => setNewClan({ ...newClan, name: e.target.value })} maxLength={30} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="What's your clan about?" value={newClan.description} onChange={(e) => setNewClan({ ...newClan, description: e.target.value })} maxLength={200} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-1.5">
                {emojiOptions.map(emoji => (
                  <button key={emoji} onClick={() => setNewClan({ ...newClan, icon_emoji: emoji })}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${newClan.icon_emoji === emoji ? 'bg-primary/30 border-2 border-primary' : 'bg-muted/30 hover:bg-muted/50'}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleCreateClan} disabled={isLoading || !newClan.name.trim()}>
              <Sparkles className="w-4 h-4 mr-1" />
              {isLoading ? 'Creating...' : 'Create & Switch'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
