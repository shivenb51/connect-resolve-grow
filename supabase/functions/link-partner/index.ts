import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { partnerEmail } = await req.json();
    if (!partnerEmail || typeof partnerEmail !== "string") {
      return new Response(JSON.stringify({ error: "partnerEmail is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticated client (uses caller's JWT) to identify current user
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentUserId = userData.user.id;

    // Service client for privileged reads/updates
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const email = partnerEmail.toLowerCase().trim();

    // Find partner profile by email
    const { data: partnerProfile, error: findErr } = await serviceClient
      .from("profiles")
      .select("id, email, partner_id")
      .eq("email", email)
      .maybeSingle();

    if (findErr) {
      console.error("Find partner error", findErr);
      return new Response(JSON.stringify({ error: "Failed to lookup partner" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!partnerProfile) {
      return new Response(JSON.stringify({ error: "Partner not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (partnerProfile.id === currentUserId) {
      return new Response(JSON.stringify({ error: "You cannot link to yourself" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update both profiles (linking)
    const { error: updateSelfErr } = await serviceClient
      .from("profiles")
      .update({ partner_id: partnerProfile.id })
      .eq("id", currentUserId);

    if (updateSelfErr) {
      console.error("Update self error", updateSelfErr);
      return new Response(JSON.stringify({ error: "Failed to update your profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updatePartnerErr } = await serviceClient
      .from("profiles")
      .update({ partner_id: currentUserId })
      .eq("id", partnerProfile.id);

    if (updatePartnerErr) {
      console.error("Update partner error", updatePartnerErr);
      return new Response(JSON.stringify({ error: "Failed to update partner profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ linkedPartnerId: partnerProfile.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("link-partner error", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});