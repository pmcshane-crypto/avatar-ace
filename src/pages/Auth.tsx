import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        toast({ title: "Error signing up", description: authError.message });
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            username: username || email.split("@")[0],
            avatar_type: "fire",
            baseline_minutes: 0,
          });

        if (profileError) {
          toast({ title: "Error creating profile", description: profileError.message });
          return;
        }

        toast({ title: "Account created! Please set up your avatar." });
        navigate("/avatar-selection");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({ title: "Error signing in", description: error.message });
        return;
      }

      toast({ title: "Welcome back!" });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
