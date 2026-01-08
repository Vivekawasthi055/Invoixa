import { supabase } from "./supabaseClient";

export const getRooms = async (hotelCode, activeOnly = true) => {
  let query = supabase.from("rooms").select("*").eq("hotel_code", hotelCode);

  if (activeOnly) query = query.eq("is_active", true);

  return await query.order("room_number");
};

export const addRoom = async ({ room_number, room_name, hotel_code }) => {
  return await supabase.from("rooms").insert({
    room_number,
    room_name,
    hotel_code,
    is_active: true,
  });
};

export const updateRoom = async (id, updates) => {
  return await supabase.from("rooms").update(updates).eq("id", id);
};
