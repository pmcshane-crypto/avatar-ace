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

export function ClanStatusCard({ member, members, userId, isDailyChampion, isWeeklyMVP }: ClanStatusCardProps) {
  if (!member) return null;

  const nextRankMember = members.find(m => m.rank === member.rank - 1);
  const minutesBehind = nextRankMember 
    ? member.todayMinutes - nextRankMember.todayMinutes 
    : 0;

  const progressToNext = nextRankMember && member.todayMinutes > 0
    ? Math.max(0, Math.min(100, ((nextRankMember.todayMinutes / member.todayMinutes) * 100)))
    : member.rank === 1 ? 100 : 0;

  const avatarImage = getAvatarImage(member.profile.avatar_type, member.profile.avatar_level);
  const avatarGlow = getAvatarGlow(member.profile.avatar_type);
  const isRare = isRareAvatar(member.profile.avatar_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-card to-accent/10 border-primary/30 p-6">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {isDailyChampion && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-amber-500/20 border border-amber-500/50 rounded-full p-2"
            >
              <Crown className="w-4 h-4 text-amber-400" />
            </motion.div>
          )}
          {isWeeklyMVP && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-purple-500/20 border border-purple-500/50 rounded-full p-2"
            >
              <Trophy className="w-4 h-4 text-purple-400" />
            </motion.div>
          )}
        </div>

        <div className="relative flex items-center gap-6">
          {/* Avatar */}
          <div className={`relative w-20 h-20 rounded-full overflow-hidden ${isRare ? 'border-2 border-amber-400 animate-pulse' : ''} ${avatarGlow}`}>
            <img 
              src={avatarImage} 
              alt={member.profile.username}
              className="w-full h-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-background">
              {member.profile.avatar_level}
            </div>
          </div>

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
                <p className="text-muted-foreground text-sm">Today</p>
                <p className="text-2xl font-semibold text-foreground">{member.todayMinutes}m</p>
              </div>
            </div>

            {/* Progress to next rank */}
            {member.rank > 1 && nextRankMember && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {minutesBehind}m behind #{member.rank - 1}
                  </span>
                  <span className="text-primary font-medium">
                    {nextRankMember.profile.username}
                  </span>
                </div>
                <Progress value={progressToNext} className="h-2" />
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
