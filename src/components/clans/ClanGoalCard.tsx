import { Clan } from '@/types/clan';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, Clock, PartyPopper, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Confetti from './Confetti';

interface ClanGoalCardProps {
  clan: Clan;
  memberCount: number;
  todayTotal: number;
  goalMet: boolean;
}

export function ClanGoalCard({ clan, memberCount, todayTotal, goalMet }: ClanGoalCardProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevGoalMet, setPrevGoalMet] = useState(goalMet);
  
  const goalTarget = clan.daily_goal_minutes * memberCount;
  const progress = goalTarget > 0 ? Math.min(100, (1 - (todayTotal / goalTarget)) * 100 + 50) : 0;
  const avgPerMember = memberCount > 0 ? Math.round(todayTotal / memberCount) : 0;

  // Calculate time remaining
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const hoursLeft = Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor(((endOfDay.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60)));

  // Trigger celebration when goal is newly met
  useEffect(() => {
    if (goalMet && !prevGoalMet) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
    setPrevGoalMet(goalMet);
  }, [goalMet, prevGoalMet]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className={`relative overflow-hidden p-6 transition-all duration-500 ${
        goalMet 
          ? 'bg-gradient-to-br from-green-500/20 via-card to-emerald-500/10 border-green-500/50 shadow-[0_0_30px_hsl(142_76%_45%/0.3)]' 
          : 'bg-gradient-to-br from-card to-muted/20 border-border/50'
      }`}>
        {/* Confetti overlay */}
        <AnimatePresence>
          {showCelebration && <Confetti />}
        </AnimatePresence>

        {/* Pulsing glow when goal is met */}
        {goalMet && (
          <motion.div
            className="absolute inset-0 bg-green-500/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className={`w-5 h-5 ${goalMet ? 'text-green-400' : 'text-primary'}`} />
              <h3 className="font-semibold text-foreground">Daily Clan Goal</h3>
            </div>
            
            {/* Streak */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-foreground">{clan.clan_streak}</span>
              <span className="text-xs text-muted-foreground">streak</span>
            </div>
          </div>

          {/* Goal status */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Avg {avgPerMember}m / {clan.daily_goal_minutes}m per member
              </span>
              <span className={goalMet ? 'text-green-400 font-medium' : 'text-muted-foreground'}>
                {goalMet ? 'Goal Met! 🎉' : `${Math.round(progress)}%`}
              </span>
            </div>
            <Progress 
              value={progress} 
              className={`h-3 ${goalMet ? '[&>div]:bg-green-500' : ''}`}
            />
          </div>

          {/* Time remaining */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{hoursLeft}h {minutesLeft}m left today</span>
            </div>
            
            {goalMet ? (
              <div className="flex items-center gap-2 text-green-400">
                <PartyPopper className="w-4 h-4" />
                <span className="font-medium">Streak continues!</span>
              </div>
            ) : (
              todayTotal > goalTarget && (
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Keep it up!</span>
                </div>
              )
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
