import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, ArrowRight, KeyRound } from "lucide-react";

type AuthView = "signin" | "signup" | "forgot" | "reset";

export default function Auth() {
  const [view, setView] = useState<AuthView>("signin");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || !username) {
      toast({ title: "Please fill in all fields" });
      return;
    }
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        phone,
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
            username,
            avatar_type: "fire",
            baseline_minutes: 0,
          });

        if (profileError) {
          toast({ title: "Error creating profile", description: profileError.message });
          return;
        }

        toast({ title: "Account created!" });
        navigate("/avatar-selection");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast({ title: "Please fill in all fields" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });

      if (error) {
        toast({ title: "Error signing in", description: error.message });
        return;
      }

      toast({ title: "Welcome back!" });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetOtp = async () => {
    if (!phone) {
      toast({ title: "Please enter your phone number" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        toast({ title: "Error sending code", description: error.message });
        return;
      }
      setOtpSent(true);
      toast({ title: "Verification code sent!" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast({ title: "Please fill in all fields" });
      return;
    }
    setIsLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });

      if (verifyError) {
        toast({ title: "Invalid code", description: verifyError.message });
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast({ title: "Error resetting password", description: updateError.message });
        return;
      }

      toast({ title: "Password reset successfully!" });
      setView("signin");
      setOtpSent(false);
      setOtp("");
      setNewPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-border/50">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            {view === "forgot" ? (
              <KeyRound className="w-7 h-7 text-primary" />
            ) : (
              <Phone className="w-7 h-7 text-primary" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {view === "signup" ? "Create Account" : view === "forgot" ? "Reset Password" : "Better Buddy"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {view === "signup"
              ? "Sign up with your phone number"
              : view === "forgot"
              ? "We'll send a code to your phone"
              : "Sign in with your phone number"}
          </p>
        </CardHeader>
        <CardContent>
          {/* SIGN IN */}
          {view === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <div className="flex flex-col gap-2">
                <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => setView("forgot")}>
                  Forgot password?
                </Button>
                <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => setView("signup")}>
                  Don't have an account? Sign up
                </Button>
              </div>
            </form>
          )}

          {/* SIGN UP */}
          {view === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => setView("signin")}>
                Already have an account? Sign in
              </Button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {view === "forgot" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-phone">Phone Number</Label>
                <Input
                  id="reset-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                  required
                />
              </div>

              {otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Choose a new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Resetting..." : "Reset Password"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={handleSendResetOtp}
                    disabled={isLoading}
                  >
                    Resend code
                  </Button>
                </>
              ) : (
                <Button type="button" className="w-full" onClick={handleSendResetOtp} disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Verification Code"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}

              <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => { setView("signin"); setOtpSent(false); setOtp(""); }}>
                Back to sign in
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
