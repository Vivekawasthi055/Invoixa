// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    const { hotel_name, email, phone } = await req.json();

    if (!hotel_name || !email || !phone) {
      throw new Error("hotel_name, email and phone are required");
    }

    // 🔐 TEMP PASSWORD
    const tempPassword = crypto.randomUUID().slice(0, 8);

    // 1️⃣ CREATE AUTH USER
    const { data: userData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) throw authError;

    const userId = userData.user.id;

    // 2️⃣ GENERATE UNIQUE HOTEL CODE (000001 → ...)
    const { data: lastHotel } = await supabase
      .from("hotels")
      .select("hotel_code")
      .order("hotel_code", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextCode = 1;

    if (lastHotel?.hotel_code) {
      nextCode = parseInt(lastHotel.hotel_code, 10) + 1;
    }

    const hotel_code = String(nextCode).padStart(6, "0");

    // 3️⃣ INSERT INTO HOTELS
    const { error: hotelError } = await supabase.from("hotels").insert({
      user_id: userId,
      hotel_code,
      hotel_name,
      email,
      phone,
      is_active: true,
      delete_requested: false,
    });

    if (hotelError) throw hotelError;

    // 4️⃣ INSERT INTO PROFILES
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      role: "hotel",
      hotel_code,
      hotel_name,
      email,
      phone,
      profile_completed: false,
      password_set: false,
    });

    if (profileError) throw profileError;

    return new Response(
      JSON.stringify({
        success: true,
        tempPassword,
        hotel_code,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("CREATE HOTEL ERROR:", err);

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
