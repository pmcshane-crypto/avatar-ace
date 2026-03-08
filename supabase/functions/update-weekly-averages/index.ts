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

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, baseline_minutes");

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No users found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    let updated = 0;

    for (const profile of profiles) {
      const { data: entries } = await supabase
        .from("screen_time_entries")
        .select("total_minutes, music_minutes, better_buddy_minutes")
        .eq("user_id", profile.id)
        .gte("date", weekAgoStr);

      if (!entries || entries.length === 0) continue;

      const avgActual = Math.round(
        entries.reduce(
          (sum, e) =>
            sum +
            e.total_minutes -
            (e.music_minutes || 0) -
            (e.better_buddy_minutes || 0),
          0
        ) / entries.length
      );

      await supabase
        .from("profiles")
        .update({ weekly_average: avgActual })
        .eq("id", profile.id);

      updated++;
    }

    return new Response(
      JSON.stringify({ message: `Updated weekly averages for ${updated} users` }),
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
