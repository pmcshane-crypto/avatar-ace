import { motion } from "framer-motion";
import { TrendingUp, Users, Target, Flame, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DailyMomentCardProps {
  contributionMinutes?: number;
  clanRank?: number;
  clanName?: string;
  totalClanMembers?: number;
  minutesBehindLeader?: number;
  isLeader?: boolean;
  reduction?: number;
  hasClans?: boolean;
}

export function DailyMomentCard({
  contributionMinutes = 0,
  clanRank,
  clanName,
  totalClanMembers = 0,
  minutesBehindLeader = 0,
  isLeader = false,
  reduction = 0,
  hasClans = false,
}: DailyMomentCardProps) {
  // Determine the primary message based on context
  const getMessage = () => {
    if (hasClans && clanRank && clanName) {
      if (isLeader) {
        return {
          icon: <Sparkles className="w-5 h-5 text-warning" />,
          title: "You're #1 in your clan today!",
          subtitle: `Leading ${clanName} with ${contributionMinutes} min reduced`,
          gradient: "from-warning/20 via-card to-card",
          borderColor: "border-warning/30",
          textColor: "text-warning",
        };
      }
      return {
        icon: <TrendingUp className="w-5 h-5 text-primary" />,
        title: `You're ranked #${clanRank} in ${clanName}`,
        subtitle: minutesBehindLeader > 0 
          ? `${minutesBehindLeader} minutes behind #${clanRank - 1}`
          : `${contributionMinutes} minutes contributed today`,
        gradient: "from-primary/20 via-card to-card",
        borderColor: "border-primary/30",
        textColor: "text-primary",
      };
    }

    if (reduction > 0) {
      return {
        icon: <Target className="w-5 h-5 text-success" />,
        title: `You've reduced ${reduction}% today!`,
        subtitle: "Keep it up! Your buddy is thriving.",
        gradient: "from-success/20 via-card to-card",
        borderColor: "border-success/30",
        textColor: "text-success",
      };
    }

    if (reduction < 0) {
      return {
        icon: <Flame className="w-5 h-5 text-destructive" />,
        title: "Your buddy needs your help today",
        subtitle: "Put the phone down and watch them recover!",
        gradient: "from-destructive/20 via-card to-card",
        borderColor: "border-destructive/30",
        textColor: "text-destructive",
      };
    }

    // Default: encouraging start
    return {
      icon: <Target className="w-5 h-5 text-accent" />,
      title: "Ready to crush it today?",
      subtitle: "Log your screen time to see your impact",
      gradient: "from-accent/20 via-card to-card",
      borderColor: "border-accent/30",
      textColor: "text-accent",
    };
  };

  const content = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className={`relative overflow-hidden bg-gradient-to-r ${content.gradient} border ${content.borderColor} p-4`}>
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-30">
          <motion.div 
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/20 blur-2xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center ${content.textColor}`}>
            {content.icon}
          </div>
          
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${content.textColor}`}>
              {content.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {content.subtitle}
            </p>
          </div>
          
          {hasClans && clanRank && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-xs">Clan</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}