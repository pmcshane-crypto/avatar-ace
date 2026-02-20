import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakFireAnimationProps {
  show: boolean;
  streak: number;
}

export function StreakFireAnimation({ show, streak }: StreakFireAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-8 left-1/2 z-[80] flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600/90 to-red-600/90 shadow-[0_0_40px_hsl(var(--warning)/0.5)]"
          initial={{ x: "-50%", y: 40, opacity: 0, scale: 0.8 }}
          animate={{ x: "-50%", y: 0, opacity: 1, scale: 1 }}
          exit={{ x: "-50%", y: 40, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Animated fire icon */}
          <motion.div
            animate={{ 
              rotate: [-5, 5, -5],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 0.6, repeat: 3 }}
          >
            <Flame className="w-7 h-7 text-yellow-300 fill-yellow-300" />
          </motion.div>

          <div className="text-white">
            <div className="font-black text-lg">{streak} Day Streak! 🔥</div>
            <div className="text-white/70 text-xs">Keep the fire alive!</div>
          </div>

          {/* Fire particles rising */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-full rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                width: 4 + Math.random() * 4,
                height: 4 + Math.random() * 4,
                backgroundColor: i % 2 === 0 ? "#FCD34D" : "#F97316",
              }}
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -60 - Math.random() * 40, opacity: 0, scale: 0 }}
              transition={{
                duration: 0.8 + Math.random() * 0.4,
                delay: i * 0.1,
                repeat: 2,
                repeatDelay: 0.3,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
