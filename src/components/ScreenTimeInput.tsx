import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, Music, Smartphone, Save } from "lucide-react";
import { AvatarType } from "@/types/avatar";

interface ScreenTimeInputProps {
  onSubmit: (data: {
    totalMinutes: number;
    musicMinutes: number;
    betterBuddyMinutes: number;
  }) => void;
  baseline?: number;
  avatarType?: AvatarType;
}

const glowColors: Record<string, string> = {
  fire: "shadow-[0_0_20px_hsl(15_100%_60%/0.4)] border-avatar-fire/60",
  water: "shadow-[0_0_20px_hsl(217_91%_60%/0.4)] border-avatar-water/60",
  nature: "shadow-[0_0_20px_hsl(142_76%_45%/0.4)] border-avatar-nature/60",
};

export const ScreenTimeInput = ({ onSubmit, baseline = 300, avatarType = "water" }: ScreenTimeInputProps) => {
  const [totalHours, setTotalHours] = useState("");
  const [totalMinutes, setTotalMinutes] = useState("");
  const [musicHours, setMusicHours] = useState("");
  const [musicMinutes, setMusicMinutes] = useState("");
  const [bbHours, setBbHours] = useState("");
  const [bbMinutes, setBbMinutes] = useState("");

  const calculateTotal = () => {
    const total = (parseInt(totalHours || "0") * 60) + parseInt(totalMinutes || "0");
    const music = (parseInt(musicHours || "0") * 60) + parseInt(musicMinutes || "0");
    const bb = (parseInt(bbHours || "0") * 60) + parseInt(bbMinutes || "0");
    return total - music - bb;
  };

  const actualTime = calculateTotal();
  const percent = baseline > 0 ? Math.min(100, Math.max(0, (actualTime / baseline) * 100)) : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const ringColor = actualTime <= 0
    ? "stroke-muted"
    : actualTime < baseline
    ? "stroke-success"
    : "stroke-destructive";

  const glow = glowColors[avatarType] || glowColors.water;

  const handleSubmit = () => {
    onSubmit({
      totalMinutes: (parseInt(totalHours || "0") * 60) + parseInt(totalMinutes || "0"),
      musicMinutes: (parseInt(musicHours || "0") * 60) + parseInt(musicMinutes || "0"),
      betterBuddyMinutes: (parseInt(bbHours || "0") * 60) + parseInt(bbMinutes || "0"),
    });
  };

  const PillInput = ({
    label,
    icon: Icon,
    hours,
    setHours,
    minutes,
    setMinutes,
    muted = false,
  }: {
    label: string;
    icon: typeof Clock;
    hours: string;
    setHours: (v: string) => void;
    minutes: string;
    setMinutes: (v: string) => void;
    muted?: boolean;
  }) => (
    <div className="space-y-2">
      <Label className={`flex items-center gap-2 text-sm ${muted ? "text-muted-foreground" : "text-foreground"}`}>
        <Icon className="w-4 h-4" />
        {label}
      </Label>
      <div className="flex gap-2">
        <div className={`flex-1 rounded-full border-2 overflow-hidden transition-all ${glow}`}>
          <Input
            type="number"
            placeholder="Hrs"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            min="0"
            className="bg-secondary border-0 text-foreground text-center rounded-full h-11"
          />
        </div>
        <div className={`flex-1 rounded-full border-2 overflow-hidden transition-all ${glow}`}>
          <Input
            type="number"
            placeholder="Min"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            min="0"
            max="59"
            className="bg-secondary border-0 text-foreground text-center rounded-full h-11"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card className="p-6 bg-gradient-card border-border/50">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Daily Screen Time</h3>
        </div>

        {/* Circular progress ring */}
        <div className="flex justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Background ring */}
              <circle
                cx="100" cy="100" r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
              />
              {/* Progress ring */}
              <circle
                cx="100" cy="100" r={radius}
                fill="none"
                className={`${ringColor} transition-all duration-700`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">
                {Math.floor(Math.abs(actualTime) / 60)}h {Math.abs(actualTime) % 60}m
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                of {Math.floor(baseline / 60)}h {baseline % 60}m baseline
              </span>
            </div>
          </div>
        </div>

        <PillInput label="Total Screen Time" icon={Smartphone} hours={totalHours} setHours={setTotalHours} minutes={totalMinutes} setMinutes={setTotalMinutes} />
        <PillInput label="Music Time (subtract)" icon={Music} hours={musicHours} setHours={setMusicHours} minutes={musicMinutes} setMinutes={setMusicMinutes} muted />
        <PillInput label="Better Buddy Time (subtract)" icon={Smartphone} hours={bbHours} setHours={setBbHours} minutes={bbMinutes} setMinutes={setBbMinutes} muted />

        <Button
          onClick={handleSubmit}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow"
          disabled={!totalHours && !totalMinutes}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Today's Time
        </Button>
      </div>
    </Card>
  );
};
