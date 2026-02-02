import { supabase } from "./supabaseClient";

/* =======================
   CREATE HOTEL (ADMIN)
======================= */
export async function createHotel({ email, hotel_name, phone }) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: { message: "Admin not authenticated" } };
    }

    const { data, error } = await supabase.functions.invoke("create-hotel", {
      body: { email, hotel_name, phone },
    });

    if (error) return { error };

    return { data };
  } catch (err) {
    return { error: { message: err.message } };
  }
}

/* =======================
   GET ALL HOTELS (ADMIN)
======================= */
export async function getAllHotels() {
  try {
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data };
  } catch (err) {
    return { error: { message: err.message } };
  }
}

/* =======================
   ENABLE / DISABLE HOTEL
======================= */
export async function toggleHotelStatus({ hotel_id, is_active }) {
  try {
    const { error } = await supabase
      .from("hotels")
      .update({ is_active })
      .eq("id", hotel_id);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return { error: { message: err.message } };
  }
}

/* ==================================
   DELETE HOTEL INVOICE/ROOMS DATA
===================================== */
export async function clearHotelCompleteData(hotel_id) {
  try {
    const { error } = await supabase.rpc("admin_clear_hotel_complete_data", {
      p_hotel_id: hotel_id,
    });

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error("CLEAR HOTEL DATA ERROR:", err);
    return { error: { message: err.message } };
  }
}
