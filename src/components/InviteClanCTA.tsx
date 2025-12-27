import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserPlus, Share2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteClanCTAProps {
  clanId?: string;
  clanName?: string;
  variant?: "minimal" | "full" | "banner";
  className?: string;
}

export function InviteClanCTA({ 
  clanId, 
  clanName = "your clan",
  variant = "minimal",
  className = ""
}: InviteClanCTAProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = clanId 
      ? `${window.location.origin}/clans?join=${clanId}`
      : `${window.location.origin}/clans`;
    
    const shareData = {
      title: 'Join my clan on Better Buddy!',
      text: `Join ${clanName} and let's reduce screen time together!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Share the link with friends to invite them",
        });
      }
    } catch (err) {
      // User cancelled share
    }
  };

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 border border-primary/30 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Grow your clan</h4>
              <p className="text-sm text-muted-foreground">Invite friends to compete together</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleShare} size="sm" variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button onClick={handleShare} size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Invite
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "full") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        className={`bg-card border border-border/50 rounded-xl p-5 ${className}`}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <UserPlus className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-foreground">Invite Friends</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Compete together and hold each other accountable
            </p>
          </div>
          <div className="flex gap-2 w-full">
            <Button onClick={handleShare} variant="outline" className="flex-1 gap-2">
              <Share2 className="w-4 h-4" />
              Share Link
            </Button>
            <Button onClick={handleShare} className="flex-1 gap-2">
              <UserPlus className="w-4 h-4" />
              Invite
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Minimal variant (default)
  return (
    <Button 
      onClick={handleShare} 
      variant="outline" 
      size="sm" 
      className={`gap-2 ${className}`}
    >
      <UserPlus className="w-4 h-4" />
      Invite to Clan
    </Button>
  );
}