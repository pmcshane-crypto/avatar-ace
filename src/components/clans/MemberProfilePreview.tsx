import { ClanMember } from '@/types/clan';
import { getAvatarImage, getAvatarGlow, isRareAvatar } from '@/lib/avatarImages';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, Crown, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface MemberProfilePreviewProps {
  member: ClanMember | null;
  isOpen: boolean;
  onClose: () => void;
  isDailyChampion: boolean;
  isWeeklyMVP: boolean;
}

export function MemberProfilePreview({ 
  member, 
  isOpen, 
  onClose,
  isDailyChampion,
  isWeeklyMVP
}: MemberProfilePreviewProps) {
  if (!member) return null;

  const avatarImage = getAvatarImage(member.profile.avatar_type, member.profile.avatar_level);
  const avatarGlow = getAvatarGlow(member.profile.avatar_type);
  const isRare = isRareAvatar(member.profile.avatar_type);

  const xpProgress = ((member.profile.avatar_level % 1) * 100) || 50;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl bg-gradient-to-b from-card to-background border-t border-border/50">
        <SheetHeader className="sr-only">
          <SheetTitle>{member.profile.username}'s Profile</SheetTitle>
        </SheetHeader>
        
        <div className="pt-4 space-y-6">
          {/* Avatar and basic info */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative w-40 h-40 rounded-full overflow-hidden border-4 ${isRare ? 'border-amber-400' : 'border-primary/50'} ${avatarGlow}`}
            >
              <img 
                src={avatarImage}
                alt={member.profile.username}
                className={`w-full h-full object-cover ${isRare ? 'saturate-150' : ''}`}
              />
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-background">
                {member.profile.avatar_level}
              </div>
            </motion.div>

            <h2 className="mt-4 text-2xl font-bold text-foreground">{member.profile.username}</h2>
            
            {/* Badges */}
            <div className="flex gap-2 mt-2">
              {isDailyChampion && (
                <Badge variant="outline" className="bg-amber-500/20 border-amber-500/50 text-amber-400">
                  <Crown className="w-3 h-3 mr-1" />
                  Daily Champion
                </Badge>
              )}
              {isWeeklyMVP && (
                <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50 text-purple-400">
                  <Trophy className="w-3 h-3 mr-1" />
                  Weekly MVP
                </Badge>
              )}
              {isRare && (
                <Badge variant="outline" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-400">
                  ✨ Rare Buddy
                </Badge>
              )}
            </div>

            {/* Avatar type tooltip */}
            <p className="text-sm text-muted-foreground mt-2 capitalize">
              {member.profile.avatar_type.replace('-', ' ')} • Level {member.profile.avatar_level}
            </p>
          </div>

          {/* XP Progress */}
          <div className="space-y-2 px-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Level Progress</span>
              <span className="text-foreground font-medium">Level {member.profile.avatar_level}</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 px-4">
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{member.profile.current_streak}</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{member.profile.best_streak}</p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{member.todayMinutes}m</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">#{member.rank}</p>
              <p className="text-xs text-muted-foreground">Current Rank</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
