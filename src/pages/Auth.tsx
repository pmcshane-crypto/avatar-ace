import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, ArrowRight } from "lucide-react";

export default function Auth() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOtp = async () => {
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });

      if (error) {
        toast({ title: "Error verifying code", description: error.message });
        return;
      }

      if (data.user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              username: username || `user_${phone.slice(-4)}`,
              avatar_type: "fire",
              baseline_minutes: 0,
            });

          if (profileError) {
            toast({ title: "Error creating profile", description: profileError.message });
            return;
          }

          toast({ title: "Account created!" });
          navigate("/avatar-selection");
        } else {
          toast({ title: "Welcome back!" });
          navigate("/dashboard");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-border/50">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Better Buddy
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Sign in with your phone number
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {!otpSent && (
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 text-sm"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                  >
                    Change number
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 text-sm"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                  >
                    Resend code
                  </Button>
                </div>
              </>
            ) : (
              <Button type="button" className="w-full" onClick={handleSendOtp} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Verification Code"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
