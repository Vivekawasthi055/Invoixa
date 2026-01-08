// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase env variables");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 🔐 Verify Admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const jwt = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(
      jwt
    );

    if (userError || !userData.user) throw new Error("Unauthorized access");

    // ⚠️ Optional: check admin role (future-proof)
    // if (!userData.user.email.endsWith("@invoixa.com")) throw new Error("Not admin");

    const body = await req.json();
    const { hotel_id, is_active } = body;

    if (!hotel_id || typeof is_active !== "boolean") {
      throw new Error("hotel_id and is_active are required");
    }

    // 🏨 Update hotel status
    const { error } = await supabase
      .from("hotels")
      .update({ is_active })
      .eq("id", hotel_id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, is_active }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("TOGGLE HOTEL STATUS ERROR:", err);

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
