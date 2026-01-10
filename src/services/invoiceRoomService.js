import { supabase } from "./supabaseClient";

// add room into invoice
export const addInvoiceRoom = async (payload) => {
  return await supabase.from("invoice_rooms").insert(payload).select().single();
};

// add per-day rates (only if different rates)
export const addInvoiceRoomRates = async (rates) => {
  return await supabase.from("invoice_room_rates").insert(rates);
};

// fetch rooms already added in invoice
export const getInvoiceRooms = async (invoiceId) => {
  return await supabase
    .from("invoice_rooms")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("id"); // ✅ FIX (created_at column nahi hai)
};
