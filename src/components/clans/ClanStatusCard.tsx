import { ClanMember } from '@/types/clan';
import { getAvatarImage, getAvatarGlow, isRareAvatar } from '@/lib/avatarImages';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, ArrowDown, Crown, Trophy, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClanStatusCardProps {
  member: ClanMember | null;
  members: ClanMember[];
  userId: string | null;
  isDailyChampion: boolean;
  isWeeklyMVP: boolean;
}

const formatMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export function ClanStatusCard({ member, members, userId, isDailyChampion, isWeeklyMVP }: ClanStatusCardProps) {
  if (!member) return null;

  const nextRankMember = members.find(m => m.rank === member.rank - 1);
  const reductionGap = nextRankMember 
    ? nextRankMember.percentReduction - member.percentReduction 
    : 0;

  const avatarImage = getAvatarImage(member.profile.avatar_type, member.profile.avatar_level);
  const isRare = isRareAvatar(member.profile.avatar_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-card to-accent/10 border-primary/30 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {isDailyChampion && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-amber-500/20 border border-amber-500/50 rounded-full p-2">
              <Crown className="w-4 h-4 text-amber-400" />
            </motion.div>
          )}
          {isWeeklyMVP && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="bg-purple-500/20 border border-purple-500/50 rounded-full p-2">
              <Trophy className="w-4 h-4 text-purple-400" />
            </motion.div>
          )}
        </div>

        <div className="relative flex items-center gap-6">
          {/* Avatar */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`relative w-20 h-20 rounded-full overflow-hidden border-2 ${isRare ? 'border-amber-400' : 'border-primary/50'}`}
          >
            <img src={avatarImage} alt={member.profile.username} className="w-full h-full object-cover" />
          </motion.div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Your Rank</p>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-foreground">#{member.rank}</span>
                  {member.movement === 'up' && <ArrowUp className="w-5 h-5 text-green-400" />}
                  {member.movement === 'down' && <ArrowDown className="w-5 h-5 text-red-400" />}
                  {member.movement === 'same' && <Minus className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">% Reduction</p>
                <p className={`text-2xl font-semibold ${member.percentReduction > 0 ? 'text-green-500' : 'text-destructive'}`}>
                  {member.percentReduction > 0 ? '+' : ''}{member.percentReduction}%
                </p>
              </div>
            </div>

            {/* Baseline info */}
            <div className="text-xs text-muted-foreground">
              Competing against: {formatMinutes(member.baselineMinutes)}/day baseline
            </div>

            {/* Progress to next rank */}
            {member.rank > 1 && nextRankMember && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {reductionGap}% behind #{member.rank - 1}
                  </span>
                  <span className="text-primary font-medium">
                    {nextRankMember.profile.username}
                  </span>
                </div>
                <Progress value={member.percentReduction > 0 && nextRankMember.percentReduction > 0 
                  ? Math.min(100, (member.percentReduction / nextRankMember.percentReduction) * 100) 
                  : 0} className="h-2" />
              </div>
            )}

            {member.rank === 1 && (
              <div className="flex items-center gap-2 text-amber-400">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">You're in the lead!</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
