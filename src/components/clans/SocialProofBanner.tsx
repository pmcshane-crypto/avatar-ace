import { useState, useEffect } from "react";
import { Flame, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface SocialProofBannerProps {
  totalUsers?: number;
  totalReduction?: number;
}

export function SocialProofBanner({ 
  totalUsers = 0, 
  totalReduction = 0 
}: SocialProofBannerProps) {
  const [displayUsers, setDisplayUsers] = useState(totalUsers);
  const [displayReduction, setDisplayReduction] = useState(totalReduction);

  // Animate numbers on change
  useEffect(() => {
    const duration = 1000;
    const steps = 20;
    const userIncrement = (totalUsers - displayUsers) / steps;
    const reductionIncrement = (totalReduction - displayReduction) / steps;
    
    if (userIncrement === 0 && reductionIncrement === 0) return;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplayUsers(prev => Math.round(prev + userIncrement));
      setDisplayReduction(prev => Math.round(prev + reductionIncrement));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalUsers, totalReduction]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 p-4"
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      <div className="relative flex flex-wrap items-center justify-center gap-6 text-sm md:text-base">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-warning/20">
            <Flame className="w-4 h-4 text-warning animate-pulse" />
          </div>
          <span className="font-semibold text-foreground">
            {displayUsers.toLocaleString()}
          </span>
          <span className="text-muted-foreground">users crushing it together</span>
        </div>
        
        <div className="hidden md:block w-px h-6 bg-border" />
        
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-success/20">
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <span className="font-semibold text-foreground">
            {displayReduction.toLocaleString()}hrs
          </span>
          <span className="text-muted-foreground">screen time reduced this week</span>
        </div>
      </div>
    </motion.div>
  );
}
