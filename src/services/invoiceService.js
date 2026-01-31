import { supabase } from "./supabaseClient";

/* =========================
   CREATE INVOICE
========================= */
export const createInvoice = async (payload) => {
  // 🔒 STEP-1: fetch full hotel snapshot
  const { data: hotel } = await supabase
    .from("hotels")
    .select(
      `
      hotel_name,
      address,
      email,
      phone,
      logo_url,
      signature_url,
      has_gst,
      gst_number,
      gst_percentage,
      gst_type
    `,
    )
    .eq("id", payload.hotel_id)
    .single();

  return await supabase
    .from("invoices")
    .insert({
      hotel_id: payload.hotel_id,
      hotel_code: payload.hotel_code,

      // 🔒 STEP-1 SNAPSHOT FIELDS
      hotel_name: hotel.hotel_name,
      hotel_address: hotel.address,
      hotel_email: hotel.email,
      hotel_phone: hotel.phone,
      hotel_logo_url: hotel.logo_url,
      hotel_signature_url: hotel.signature_url,

      has_gst: hotel.has_gst,
      gst_number: hotel.gst_number,
      gst_percentage: hotel.gst_percentage,

      gst_type: hotel.gst_type || "cgst_sgst",

      invoice_number: payload.invoice_number,

      guest_name: "",
      guest_phone: "",
      guest_email: "",

      subtotal: 0,
      grand_total: 0,
    })
    .select()
    .single();
};

/* =========================
   UPDATE GUEST DETAILS
========================= */
export const updateInvoiceGuest = async (invoiceId, guestData) => {
  return await supabase.from("invoices").update(guestData).eq("id", invoiceId);
};

/* =========================
   ADD FOOD & SERVICES
========================= */
export const addInvoiceFoodServices = async (items) => {
  return await supabase.from("invoice_food_services").insert(items);
};

/* =========================
   FINALIZE INVOICE
========================= */
export const finalizeInvoice = async ({
  invoiceId,
  subtotal,
  discount_type,
  discount_value,
  taxable_amount,
  gst_amount,
  grand_total,
  payment_mode,
  status,
}) => {
  return await supabase
    .from("invoices")
    .update({
      subtotal,
      discount_type,
      discount_value,
      taxable_amount,
      gst_amount,
      grand_total,
      payment_mode,
      status,
    })
    .eq("id", invoiceId)
    .select()
    .single();
};

/* =========================
   SEARCH INVOICES
========================= */
export const searchInvoices = async ({
  hotel_code,
  invoice_number,
  guest_name,
  status,
  min_amount,
  max_amount,
  from_date,
  to_date,
}) => {
  let query = supabase
    .from("invoices")
    .select("*")
    .eq("hotel_code", hotel_code)
    .order("created_at", { ascending: false });

  if (invoice_number)
    query = query.ilike("invoice_number", `%${invoice_number}%`);

  if (guest_name) query = query.ilike("guest_name", `%${guest_name}%`);

  if (status) query = query.eq("status", status);

  if (min_amount) query = query.gte("grand_total", min_amount);
  if (max_amount) query = query.lte("grand_total", max_amount);

  if (from_date) query = query.gte("created_at", from_date);
  if (to_date) query = query.lte("created_at", to_date);

  return await query;
};

export const generateInvoiceNumber = async (hotel_code) => {
  const { data, error } = await supabase.rpc("generate_invoice_number", {
    p_hotel_code: hotel_code,
  });

  if (error) throw error;
  return data;
};
