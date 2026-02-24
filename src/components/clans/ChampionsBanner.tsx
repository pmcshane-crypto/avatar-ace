import { DailyChampion, WeeklyMVP } from '@/types/clan';
import { getAvatarImage, getAvatarGlow, isRareAvatar } from '@/lib/avatarImages';
import { Card } from '@/components/ui/card';
import { Crown, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChampionsBannerProps {
  dailyChampion: DailyChampion | null;
  weeklyMVP: WeeklyMVP | null;
}

export function ChampionsBanner({ dailyChampion, weeklyMVP }: ChampionsBannerProps) {
  if (!dailyChampion && !weeklyMVP) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Daily Champion */}
      {dailyChampion && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-card to-yellow-500/10 border-amber-500/30 p-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl" />
          
          <div className="relative flex items-center gap-4">
            <div className={`relative w-16 h-16 flex-shrink-0 ${getAvatarGlow(dailyChampion.avatar_type)}`}>
              <img 
                src={getAvatarImage(dailyChampion.avatar_type, dailyChampion.avatar_level)}
                alt={dailyChampion.username}
                className={`w-full h-full object-contain drop-shadow-lg ${isRareAvatar(dailyChampion.avatar_type) ? 'saturate-150' : ''}`}
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Daily Champion</span>
              </div>
              <p className="font-bold text-foreground text-lg">{dailyChampion.username}</p>
              <p className="text-sm text-muted-foreground">{dailyChampion.contribution}m today</p>
            </div>

            <div className="flex">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Weekly MVP */}
      {weeklyMVP && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-card to-violet-500/10 border-purple-500/30 p-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl" />
          
          <div className="relative flex items-center gap-4">
            <div className={`relative w-16 h-16 flex-shrink-0 ${getAvatarGlow(weeklyMVP.avatar_type)}`}>
              <img 
                src={getAvatarImage(weeklyMVP.avatar_type, weeklyMVP.avatar_level)}
                alt={weeklyMVP.username}
                className={`w-full h-full object-contain drop-shadow-lg ${isRareAvatar(weeklyMVP.avatar_type) ? 'saturate-150' : ''}`}
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Weekly MVP</span>
              </div>
              <p className="font-bold text-foreground text-lg">{weeklyMVP.username}</p>
              <p className="text-sm text-muted-foreground">{weeklyMVP.daysActive} days active</p>
            </div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-purple-500/20 rounded-full p-2"
            >
              <Trophy className="w-6 h-6 text-purple-400" />
            </motion.div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
