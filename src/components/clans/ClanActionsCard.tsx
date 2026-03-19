import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, Link2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ClanActionsCardProps {
  clanId: string;
  clanName: string;
}

export function ClanActionsCard({ clanId, clanName }: ClanActionsCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const inviteLink = `${window.location.origin}/join-clan/${clanId}`;
  const clanCode = clanId.slice(0, 8).toUpperCase();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: 'Invite link copied!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(clanCode);
      setCodeCopied(true);
      toast({ title: `Code "${clanCode}" copied!` });
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${clanName} on Better Buddy!`,
          text: `Join my clan "${clanName}" and let's reduce screen time together!`,
          url: inviteLink,
        });
      } catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <Card className="p-4 space-y-3 border-primary/20">
        {/* Big invite button */}
        <Button onClick={handleShare} className="w-full h-12 text-base gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25">
          <UserPlus className="w-5 h-5" />
          Invite Friends
        </Button>

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyCode}>
            {codeCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {codeCopied ? 'Copied!' : `Code: ${clanCode}`}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyLink}>
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Link2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share Link'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
