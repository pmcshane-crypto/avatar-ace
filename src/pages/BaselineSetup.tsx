import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Clock, Smartphone } from "lucide-react";

const BaselineSetup = () => {
  const [baselineHours, setBaselineHours] = useState("");
  const [baselineMinutes, setBaselineMinutes] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    const totalMinutes = (parseInt(baselineHours || "0") * 60) + parseInt(baselineMinutes || "0");
    localStorage.setItem('baseline', totalMinutes.toString());
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Set Your Baseline</h1>
          <p className="text-muted-foreground">
            Enter your average daily screen time from last week
          </p>
        </div>

        <Card className="p-8 bg-gradient-card border-border/50">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Weekly Average</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground mb-2 block">Hours</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={baselineHours}
                  onChange={(e) => setBaselineHours(e.target.value)}
                  min="0"
                  className="bg-secondary border-border text-foreground text-2xl h-16 text-center"
                />
              </div>

              <div>
                <Label className="text-foreground mb-2 block">Minutes</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={baselineMinutes}
                  onChange={(e) => setBaselineMinutes(e.target.value)}
                  min="0"
                  max="59"
                  className="bg-secondary border-border text-foreground text-2xl h-16 text-center"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total per day:</span>
                <span className="text-3xl font-bold text-primary">
                  {baselineHours || "0"}h {baselineMinutes || "0"}m
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-muted/50 border-border/50">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">How to Find Your Screen Time (iPhone)</h3>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Login to your iPhone and click <span className="font-semibold text-foreground">Settings</span></li>
              <li>Scroll down to <span className="font-semibold text-foreground">Screen Time</span> (Should have a purple logo)</li>
              <li>Click <span className="font-semibold text-foreground">See All App & Website Activity</span></li>
              <li>Click <span className="font-semibold text-foreground">Week</span></li>
              <li>Input your <span className="font-semibold text-foreground">Weekly Average</span> above</li>
            </ol>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!baselineHours && !baselineMinutes}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg w-full"
            size="lg"
          >
            Start Journey
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BaselineSetup;
