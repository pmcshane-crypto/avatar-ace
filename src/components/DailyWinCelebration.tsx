import { motion, AnimatePresence } from "framer-motion";
import { Trophy, PartyPopper } from "lucide-react";
import Confetti from "@/components/clans/Confetti";

interface DailyWinCelebrationProps {
  show: boolean;
  reductionPercent: number;
}

export function DailyWinCelebration({ show, reductionPercent }: DailyWinCelebrationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Confetti />

          {/* Central burst */}
          <motion.div
            className="relative flex flex-col items-center gap-3 bg-card/95 backdrop-blur-md border border-success/50 rounded-3xl px-10 py-8 shadow-[0_0_60px_hsl(var(--success)/0.4)] pointer-events-auto"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0, 1.1, 1], rotate: [-10, 3, 0] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {/* Trophy bounce */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              <Trophy className="w-14 h-14 text-warning fill-warning/20" />
            </motion.div>

            <motion.h2
              className="text-2xl font-black text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Daily Win! 🎉
            </motion.h2>

            <motion.p
              className="text-success font-bold text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              -{reductionPercent}% screen time
            </motion.p>

            <motion.p
              className="text-muted-foreground text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Your buddy is thriving!
            </motion.p>

            {/* Pulsing glow */}
            <motion.div
              className="absolute -z-10 inset-0 rounded-3xl bg-success/10"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
