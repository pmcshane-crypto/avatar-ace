import { ClanMember } from '@/types/clan';
import { getAvatarImage, getAvatarGlow, isRareAvatar, getAvatarBorderColor } from '@/lib/avatarImages';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus, Sparkles, Crown, Trophy, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardRowProps {
  member: ClanMember;
  isCurrentUser: boolean;
  isDailyChampion: boolean;
  isWeeklyMVP: boolean;
  onReact: (memberId: string, emoji: string) => void;
  onTap: (member: ClanMember) => void;
}

const REACTION_EMOJIS = ['🔥', '👀', '💪'];

function LeaderboardRow({ 
  member, 
  isCurrentUser, 
  isDailyChampion, 
  isWeeklyMVP,
  onReact, 
  onTap 
}: LeaderboardRowProps) {
  const avatarImage = getAvatarImage(member.profile.avatar_type, member.profile.avatar_level);
  const avatarGlow = getAvatarGlow(member.profile.avatar_type);
  const borderColor = getAvatarBorderColor(member.profile.avatar_type);
  const isRare = isRareAvatar(member.profile.avatar_type);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-amber-400';
    if (rank === 2) return 'text-slate-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  const getMovementIcon = () => {
    switch (member.movement) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      case 'new':
        return <Sparkles className="w-4 h-4 text-accent" />;
      default:
        return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onTap(member)}
      className={`cursor-pointer rounded-xl p-3 transition-all ${
        isCurrentUser 
          ? 'bg-primary/20 border-2 border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.3)]' 
          : 'bg-card/50 border border-border/30 hover:bg-card/80'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className={`w-8 text-center font-bold text-lg ${getRankColor(member.rank)}`}>
          {member.rank === 1 ? '👑' : `#${member.rank}`}
        </div>

        {/* Avatar */}
        <div className={`relative w-14 h-14 flex-shrink-0 ${isRare ? avatarGlow : ''}`}>
          <img 
            src={avatarImage} 
            alt={member.profile.username}
            className={`w-full h-full object-contain drop-shadow-lg ${isRare ? 'saturate-150' : ''}`}
          />
          <div className="absolute -bottom-0.5 -right-0.5 bg-background text-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-border">
            {member.profile.avatar_level}
          </div>
        </div>

        {/* Name and badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
              {member.profile.username}
              {isCurrentUser && <span className="text-muted-foreground ml-1">(you)</span>}
            </span>
            {isDailyChampion && (
              <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            {isWeeklyMVP && (
              <Trophy className="w-4 h-4 text-purple-400 flex-shrink-0" />
            )}
            {member.profile.current_streak >= 7 && (
              <div className="flex items-center gap-0.5 text-orange-400">
                <Flame className="w-3 h-3" />
                <span className="text-xs">{member.profile.current_streak}</span>
              </div>
            )}
          </div>
          
          {/* Reactions */}
          <div className="flex gap-1 mt-1">
            {member.reactions?.map((reaction, idx) => (
              reaction.count > 0 && (
                <span 
                  key={idx}
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    reaction.hasReacted ? 'bg-primary/20' : 'bg-muted/50'
                  }`}
                >
                  {reaction.emoji} {reaction.count}
                </span>
              )
            ))}
          </div>
        </div>

        {/* Movement indicator */}
        <div className="flex items-center gap-1">
          {getMovementIcon()}
        </div>

        {/* Today's contribution */}
        <div className="text-right">
          <div className="font-semibold text-foreground">{member.todayMinutes}m</div>
          <div className="text-xs text-muted-foreground">today</div>
        </div>

        {/* Quick reactions */}
        <div className="flex gap-1 ml-2">
          {REACTION_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                onReact(member.id, emoji);
              }}
              className="w-8 h-8 rounded-full bg-muted/30 hover:bg-muted/60 flex items-center justify-center text-sm transition-all hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface LiveLeaderboardProps {
  members: ClanMember[];
  userId: string | null;
  dailyChampionId: string | null;
  weeklyMVPId: string | null;
  onReact: (memberId: string, emoji: string) => void;
  onMemberTap: (member: ClanMember) => void;
}

export function LiveLeaderboard({ 
  members, 
  userId, 
  dailyChampionId,
  weeklyMVPId,
  onReact, 
  onMemberTap 
}: LiveLeaderboardProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Live Leaderboard</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {members.map((member) => (
          <LeaderboardRow
            key={member.id}
            member={member}
            isCurrentUser={member.user_id === userId}
            isDailyChampion={member.user_id === dailyChampionId}
            isWeeklyMVP={member.user_id === weeklyMVPId}
            onReact={onReact}
            onTap={onMemberTap}
          />
        ))}
      </AnimatePresence>

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No members yet. Be the first to contribute!
        </div>
      )}
    </div>
  );
}
