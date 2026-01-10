import { supabase } from "./supabaseClient";

export const addInvoiceFoodServices = async (items) => {
  return await supabase.from("invoice_food_services").insert(items);
};

export const getInvoiceFoodServices = async (invoiceRoomId) => {
  return await supabase
    .from("invoice_food_services")
    .select("*")
    .eq("invoice_room_id", invoiceRoomId);
};
