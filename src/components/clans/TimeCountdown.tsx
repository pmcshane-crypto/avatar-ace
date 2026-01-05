import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function TimeCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isUrgent = timeLeft.hours < 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Card className={`p-3 flex items-center justify-center gap-3 ${
        isUrgent 
          ? 'bg-red-500/10 border-red-500/30' 
          : 'bg-muted/30 border-border/30'
      }`}>
        <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-muted-foreground'}`} />
        <div className="flex items-center gap-1 font-mono">
          <TimeUnit value={timeLeft.hours} label="h" isUrgent={isUrgent} />
          <span className={isUrgent ? 'text-red-400' : 'text-muted-foreground'}>:</span>
          <TimeUnit value={timeLeft.minutes} label="m" isUrgent={isUrgent} />
          <span className={isUrgent ? 'text-red-400' : 'text-muted-foreground'}>:</span>
          <TimeUnit value={timeLeft.seconds} label="s" isUrgent={isUrgent} />
        </div>
        <span className={`text-sm ${isUrgent ? 'text-red-400' : 'text-muted-foreground'}`}>
          left today
        </span>
      </Card>
    </motion.div>
  );
}

function TimeUnit({ value, label, isUrgent }: { value: number; label: string; isUrgent: boolean }) {
  return (
    <div className={`flex items-baseline ${isUrgent ? 'text-red-400' : 'text-foreground'}`}>
      <span className="text-lg font-bold w-6 text-center">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
