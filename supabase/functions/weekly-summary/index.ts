import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users with their profiles and this week's screen time
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_type, baseline_minutes, current_streak, total_reduction");

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No users found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    let notificationsSent = 0;

    for (const profile of profiles) {
      // Get this week's entries
      const { data: entries } = await supabase
        .from("screen_time_entries")
        .select("total_minutes, music_minutes, better_buddy_minutes, date")
        .eq("user_id", profile.id)
        .gte("date", weekAgoStr)
        .order("date");

      if (!entries || entries.length === 0) continue;

      const totalActual = entries.reduce((sum, e) => {
        return sum + e.total_minutes - (e.music_minutes || 0) - (e.better_buddy_minutes || 0);
      }, 0);
      const avgActual = Math.round(totalActual / entries.length);
      const reductionPercent = Math.round(
        ((profile.baseline_minutes - avgActual) / profile.baseline_minutes) * 100
      );

      await supabase.from("notifications").insert([{
        user_id: profile.id,
        type: "weekly_summary",
        title: "📊 Weekly Report Ready!",
        message: `You reduced screen time by ${reductionPercent}% this week with ${entries.length} days tracked. ${
          reductionPercent > 0 ? "Keep it up! 🔥" : "Let's bounce back next week! 💪"
        }`,
        icon: "📊",
        metadata: {
          reduction_percent: reductionPercent,
          days_tracked: entries.length,
          avg_minutes: avgActual,
        },
      }]);

      notificationsSent++;
    }

    return new Response(
      JSON.stringify({ message: `Sent ${notificationsSent} weekly summaries` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
