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

    // Get all clan members grouped by clan
    const { data: clans } = await supabase
      .from("clans")
      .select("id, name, icon_emoji");

    if (!clans || clans.length === 0) {
      return new Response(JSON.stringify({ message: "No clans found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    let notificationsSent = 0;

    for (const clan of clans) {
      // Get clan members
      const { data: members } = await supabase
        .from("clan_members")
        .select("user_id")
        .eq("clan_id", clan.id);

      if (!members || members.length === 0) continue;

      const memberIds = members.map((m) => m.user_id).filter(Boolean) as string[];

      // Get each member's activity this week
      const memberStats: { userId: string; username: string; daysActive: number; reductionChange: number }[] = [];

      for (const memberId of memberIds) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, baseline_minutes, total_reduction")
          .eq("id", memberId)
          .single();

        if (!profile) continue;

        const { data: entries } = await supabase
          .from("screen_time_entries")
          .select("total_minutes, music_minutes, better_buddy_minutes")
          .eq("user_id", memberId)
          .gte("date", weekAgoStr);

        const daysActive = entries?.length || 0;

        // Calculate this week's avg reduction
        let weekReduction = 0;
        if (entries && entries.length > 0) {
          const avgActual = entries.reduce((sum, e) =>
            sum + e.total_minutes - (e.music_minutes || 0) - (e.better_buddy_minutes || 0), 0
          ) / entries.length;
          weekReduction = Math.round(((profile.baseline_minutes - avgActual) / profile.baseline_minutes) * 100);
        }

        memberStats.push({
          userId: memberId,
          username: profile.username,
          daysActive,
          reductionChange: weekReduction,
        });
      }

      if (memberStats.length === 0) continue;

      // Sort by days active for MVP
      const sorted = [...memberStats].sort((a, b) => b.daysActive - a.daysActive);
      const mvp = sorted[0];

      // Sort by reduction change for most improved
      const mostImproved = [...memberStats].sort((a, b) => b.reductionChange - a.reductionChange)[0];

      // Send notifications to all clan members
      for (let i = 0; i < memberStats.length; i++) {
        const member = memberStats[i];
        const rank = sorted.findIndex((s) => s.userId === member.userId) + 1;

        // Leaderboard notification
        await supabase.from("notifications").insert([{
          user_id: member.userId,
          type: "weekly_leaderboard",
          title: `👑 ${clan.name} Weekly Results`,
          message: `${mvp.username} won MVP with ${mvp.daysActive} days active! You finished #${rank}. New week starts now — can you take the top spot?`,
          icon: clan.icon_emoji || "👑",
          metadata: {
            clan_id: clan.id,
            mvp_username: mvp.username,
            rank,
            days_active: member.daysActive,
          },
        }]);

        // Most improved notification
        if (mostImproved.reductionChange > 0) {
          await supabase.from("notifications").insert([{
            user_id: member.userId,
            type: "most_improved",
            title: "📈 Most Improved This Week",
            message: `${mostImproved.username} reduced screen time by ${mostImproved.reductionChange}% this week! Can you beat them this week?`,
            icon: "📈",
            metadata: {
              clan_id: clan.id,
              improved_username: mostImproved.username,
              reduction_change: mostImproved.reductionChange,
            },
          }]);
        }

        notificationsSent++;
      }
    }

    return new Response(
      JSON.stringify({ message: `Sent ${notificationsSent} leaderboard notifications` }),
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
