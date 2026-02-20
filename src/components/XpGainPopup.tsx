import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingDown } from "lucide-react";

interface XpGainPopupProps {
  show: boolean;
  amount: number;
}

export function XpGainPopup({ show, amount }: XpGainPopupProps) {
  const isPositive = amount > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-20 left-1/2 z-[90] flex items-center gap-2 px-5 py-3 rounded-full shadow-lg"
          style={{
            background: isPositive
              ? "linear-gradient(135deg, hsl(var(--success) / 0.9), hsl(var(--primary) / 0.9))"
              : "linear-gradient(135deg, hsl(var(--destructive) / 0.9), hsl(var(--warning) / 0.9))",
          }}
          initial={{ x: "-50%", y: -40, opacity: 0, scale: 0.5 }}
          animate={{ x: "-50%", y: 0, opacity: 1, scale: [0.5, 1.15, 1] }}
          exit={{ x: "-50%", y: -30, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.35, ease: "backOut" }}
        >
          {isPositive ? (
            <Zap className="w-5 h-5 text-white fill-white" />
          ) : (
            <TrendingDown className="w-5 h-5 text-white" />
          )}
          <span className="text-white font-bold text-lg">
            {isPositive ? "+" : ""}{amount} XP
          </span>
          
          {/* Sparkle particles */}
          {isPositive && Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-white"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: (Math.random() - 0.5) * 80,
                y: (Math.random() - 0.5) * 60,
                opacity: 0,
                scale: [1, 0],
              }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
