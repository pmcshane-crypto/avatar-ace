import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, Music, Smartphone, Save } from "lucide-react";

interface ScreenTimeInputProps {
  onSubmit: (data: {
    totalMinutes: number;
    musicMinutes: number;
    betterBuddyMinutes: number;
  }) => void;
}

export const ScreenTimeInput = ({ onSubmit }: ScreenTimeInputProps) => {
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

  const handleSubmit = () => {
    onSubmit({
      totalMinutes: (parseInt(totalHours || "0") * 60) + parseInt(totalMinutes || "0"),
      musicMinutes: (parseInt(musicHours || "0") * 60) + parseInt(musicMinutes || "0"),
      betterBuddyMinutes: (parseInt(bbHours || "0") * 60) + parseInt(bbMinutes || "0"),
    });
  };

  return (
    <Card className="p-6 bg-gradient-card border-border/50">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Daily Screen Time</h3>
        </div>

        {/* Total Screen Time */}
        <div className="space-y-2">
          <Label className="text-foreground flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Total Screen Time
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Hours"
                value={totalHours}
                onChange={(e) => setTotalHours(e.target.value)}
                min="0"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Minutes"
                value={totalMinutes}
                onChange={(e) => setTotalMinutes(e.target.value)}
                min="0"
                max="59"
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Music Time */}
        <div className="space-y-2">
          <Label className="text-muted-foreground flex items-center gap-2">
            <Music className="w-4 h-4" />
            Music Time (subtract)
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Hours"
                value={musicHours}
                onChange={(e) => setMusicHours(e.target.value)}
                min="0"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Minutes"
                value={musicMinutes}
                onChange={(e) => setMusicMinutes(e.target.value)}
                min="0"
                max="59"
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Better Buddy Time */}
        <div className="space-y-2">
          <Label className="text-muted-foreground flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Better Buddy Time (subtract)
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Hours"
                value={bbHours}
                onChange={(e) => setBbHours(e.target.value)}
                min="0"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Minutes"
                value={bbMinutes}
                onChange={(e) => setBbMinutes(e.target.value)}
                min="0"
                max="59"
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Actual Time Display */}
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Actual Screen Time:</span>
            <span className="text-2xl font-bold text-primary">
              {Math.floor(actualTime / 60)}h {actualTime % 60}m
            </span>
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!totalHours && !totalMinutes}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Today's Time
        </Button>
      </div>
    </Card>
  );
};
