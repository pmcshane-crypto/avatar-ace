import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, QrCode, Copy, Users, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InviteCTAProps {
  clanId: string;
  clanName: string;
  memberCount: number;
  maxMembers?: number;
}

export function InviteCTA({ clanId, clanName, memberCount, maxMembers }: InviteCTAProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const inviteLink = `${window.location.origin}/join-clan/${clanId}`;
  const spotsLeft = maxMembers ? maxMembers - memberCount : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: 'Link copied!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy link', variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${clanName} on Better Buddy!`,
          text: `I'm inviting you to join my clan "${clanName}" on Better Buddy. Let's reduce our screen time together!`,
          url: inviteLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-gradient-to-r from-primary/10 via-card to-accent/10 border-primary/30 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-full p-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Grow Your Clan</p>
              {spotsLeft !== null ? (
                <p className="text-sm text-muted-foreground">
                  {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Clan is full'}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{memberCount} members</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <QrCode className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  {/* QR Code placeholder - in production use a QR library */}
                  <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                    <div className="text-center p-4">
                      <QrCode className="w-32 h-32 text-black mx-auto" />
                      <p className="text-xs text-gray-500 mt-2">Scan to join</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this code to join {clanName}
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>

            <Button onClick={handleShare} className="rounded-full gap-2">
              <Share2 className="w-4 h-4" />
              Invite
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
