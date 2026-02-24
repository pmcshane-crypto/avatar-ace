import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, Users, TrendingUp, Zap } from "lucide-react";

const screens = [
  {
    title: "Welcome to Better Buddy",
    tagline: "Your phone addiction ends here",
    icon: Sparkles,
    gradient: "from-primary/30 via-accent/20 to-primary/10",
    animation: "evolve",
  },
  {
    title: "Join a Clan",
    tagline: "Challenge your friends to use their phones less",
    icon: Users,
    gradient: "from-success/30 via-accent/20 to-success/10",
    animation: "friends",
  },
  {
    title: "Reduce. Evolve. Win.",
    tagline: "The less you scroll, the stronger your buddy gets",
    icon: TrendingUp,
    gradient: "from-warning/30 via-destructive/20 to-warning/10",
    animation: "xp",
  },
];

const Onboarding = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("onboardingComplete")) {
      navigate("/avatar-selection");
    }
  }, [navigate]);

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      localStorage.setItem("onboardingComplete", "true");
      navigate("/avatar-selection");
    }
  };

  const screen = screens[currentScreen];
  const isLast = currentScreen === screens.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex flex-col items-center text-center space-y-10 max-w-md w-full"
        >
          {/* Animated illustration area */}
          <div className={`relative w-56 h-56 rounded-full bg-gradient-to-br ${screen.gradient} flex items-center justify-center`}>
            {/* Orbiting ring */}
            <motion.div
              className="absolute inset-[-8px] rounded-full border-2 border-primary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-[-20px] rounded-full border border-accent/10"
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />

            {screen.animation === "evolve" && (
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((level) => (
                  <motion.div
                    key={level}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: level * 0.3, type: "spring", stiffness: 200 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`rounded-xl bg-secondary flex items-center justify-center ${
                      level === 1 ? "w-10 h-10" : level === 2 ? "w-14 h-14" : "w-18 h-18"
                    }`}>
                      <Zap className={`text-primary ${
                        level === 1 ? "w-5 h-5" : level === 2 ? "w-7 h-7" : "w-9 h-9"
                      }`} />
                    </div>
                    <motion.div
                      className="text-[10px] text-muted-foreground mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: level * 0.3 + 0.2 }}
                    >
                      Lv.{level}
                    </motion.div>
                  </motion.div>
                ))}
                {/* Arrow indicators */}
                <motion.div
                  className="absolute"
                  style={{ left: "32%", top: "50%" }}
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight className="w-4 h-4 text-primary/50" />
                </motion.div>
              </div>
            )}

            {screen.animation === "friends" && (
              <div className="flex flex-col items-center gap-2">
                {[
                  { rank: "🥇", name: "You", bar: "w-32" },
                  { rank: "🥈", name: "Alex", bar: "w-24" },
                  { rank: "🥉", name: "Sam", bar: "w-16" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.25, type: "spring" }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-lg">{item.rank}</span>
                    <span className="text-xs text-foreground w-10 text-left">{item.name}</span>
                    <motion.div
                      className={`h-3 rounded-full bg-primary/60 ${item.bar}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: i * 0.25 + 0.3, duration: 0.5 }}
                      style={{ originX: 0 }}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {screen.animation === "xp" && (
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  className="text-5xl font-black text-primary"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  +XP
                </motion.div>
                <div className="w-36 h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "20%" }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  />
                </div>
                <motion.div
                  className="text-xs text-accent font-bold"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  LEVEL UP! ✨
                </motion.div>
              </div>
            )}
          </div>

          {/* Text content */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">{screen.title}</h1>
            <p className="text-lg text-muted-foreground">{screen.tagline}</p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            {screens.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentScreen
                    ? "w-8 bg-primary"
                    : i < currentScreen
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={handleNext}
            size="lg"
            className="px-10 py-6 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
          >
            {isLast ? "Get Started" : "Next"}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
