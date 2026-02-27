import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Smartphone, TrendingDown, Users, Zap } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard if user has already set up
    const hasAvatar = localStorage.getItem('selectedAvatarType');
    const hasBaseline = localStorage.getItem('baseline');
    if (hasAvatar && hasBaseline) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground animate-float">
            Better Buddy's
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Transform screen time into an adventure
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Reduce your phone usage, evolve your avatar, and compete with friends in the most engaging way possible.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl w-full">
          <div className="p-6 rounded-2xl bg-gradient-card border border-border/50 space-y-3">
            <Smartphone className="w-10 h-10 text-primary mx-auto" />
            <h3 className="font-semibold text-foreground">Track Screen Time</h3>
            <p className="text-sm text-muted-foreground">Monitor your daily usage and see real progress</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-card border border-border/50 space-y-3">
            <Zap className="w-10 h-10 text-accent mx-auto" />
            <h3 className="font-semibold text-foreground">Evolve Your Avatar</h3>
            <p className="text-sm text-muted-foreground">Watch your buddy grow as you reduce screen time</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-card border border-border/50 space-y-3">
            <Users className="w-10 h-10 text-success mx-auto" />
            <h3 className="font-semibold text-foreground">Compete with Friends</h3>
            <p className="text-sm text-muted-foreground">Join clans and challenge your friends</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-card border border-border/50 space-y-3">
            <TrendingDown className="w-10 h-10 text-warning mx-auto" />
            <h3 className="font-semibold text-foreground">Build Streaks</h3>
            <p className="text-sm text-muted-foreground">Maintain consistency and unlock rewards</p>
          </div>
        </div>

        <Button
          onClick={() => navigate('/onboarding')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-8 text-xl shadow-glow"
          size="lg"
        >
          Start Your Journey
        </Button>
      </div>
    </div>
  );
};

export default Index;
