import { motion, AnimatePresence } from "framer-motion";
import { Star, Zap, ArrowUp } from "lucide-react";
import Confetti from "@/components/clans/Confetti";

interface LevelUpOverlayProps {
  show: boolean;
  newLevel: number;
  avatarType: string;
}

export function LevelUpOverlay({ show, newLevel, avatarType }: LevelUpOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Confetti */}
          <Confetti />

          {/* Radial burst */}
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2.5, 2], opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Ring burst */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 rounded-full border-2 border-primary/60"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 3 + i], opacity: [0.8, 0] }}
              transition={{ duration: 1.2, delay: i * 0.15, ease: "easeOut" }}
            />
          ))}

          {/* Floating particles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 120 + Math.random() * 60;
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 rounded-full bg-primary"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{ duration: 1, delay: 0.2 + i * 0.05, ease: "easeOut" }}
              />
            );
          })}

          {/* Center content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4"
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: [0, 1.2, 1], y: [20, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
          >
            {/* Arrow up icon */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowUp className="w-8 h-8 text-primary" />
            </motion.div>

            {/* LEVEL UP text */}
            <motion.h1
              className="text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              LEVEL UP!
            </motion.h1>

            {/* Level number */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Star className="w-6 h-6 text-warning fill-warning" />
              <span className="text-3xl font-bold text-foreground">
                Level {newLevel}
              </span>
              <Star className="w-6 h-6 text-warning fill-warning" />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="text-muted-foreground text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Your buddy is evolving!
            </motion.p>

            {/* Pulsing glow behind */}
            <motion.div
              className="absolute -z-10 w-64 h-64 rounded-full bg-primary/20 blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
