import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, Users, TrendingUp, Zap } from "lucide-react";
import betterBuddyIntro from "@/assets/better-buddy-intro.png";
import clanBuddies from "@/assets/clan-buddies.png";

const screens = [
  {
    title: "Welcome to Better Buddy",
    tagline: "Your phone addiction ends here",
    icon: Sparkles,
    gradient: "from-primary/30 via-accent/20 to-primary/10",
    animation: "evolve",
  },
  {
    title: "Join a Clan With Friends!",
    tagline: "Challenge your friends to use their phones less",
    icon: Users,
    gradient: "from-success/30 via-accent/20 to-success/10",
    animation: "friends",
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
              <motion.img
                src={betterBuddyIntro}
                alt="Better Buddy characters"
                className="w-full h-full object-cover rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
            )}

            {screen.animation === "friends" && (
              <motion.img
                src={clanBuddies}
                alt="Clan buddies"
                className="w-full h-full object-cover rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
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
