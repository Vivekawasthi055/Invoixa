import { supabase } from "./supabaseClient";

export const createInvoice = async (payload) => {
  return await supabase
    .from("invoices")
    .insert({
      hotel_id: payload.hotel_id,
      hotel_code: payload.hotel_code,
      hotel_name: payload.hotel_name,
      logo_url: payload.logo_url,
      subtotal: 0,
      grand_total: 0,
      invoice_number: payload.invoice_number,
      guest_name: payload.guest_name,
    })
    .select()
    .single();
};

export const addInvoiceFoodServices = async (items) => {
  return await supabase.from("invoice_food_services").insert(items);
};
