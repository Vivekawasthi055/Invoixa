import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { finalizeInvoice } from "../../services/invoiceService";

function FinalInvoice() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paymentModes, setPaymentModes] = useState([]);

  /* ================= DISCOUNT ================= */
  const [discountType, setDiscountType] = useState("flat");
  const [discountValue, setDiscountValue] = useState(0);

  const isPaid = invoice?.status === "Paid";

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const printStyles = `
@media print {
  button, select, a, input {
    display: none !important;
  }
  body {
    background: #fff;
  }
}
`;

  const togglePaymentMode = (mode) => {
    setPaymentModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  /* ================= LOAD INVOICE ================= */

  const loadInvoice = async () => {
    setLoading(true);

    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (!invoiceData) {
      setLoading(false);
      return;
    }

    setInvoice(invoiceData);

    /* ✅ Restore saved discount on reload */
    setDiscountType(invoiceData.discount_type || "flat");
    setDiscountValue(Number(invoiceData.discount_value || 0));

    const { data: hotelData } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", invoiceData.hotel_id)
      .single();

    setHotel(hotelData);

    const { data: roomData } = await supabase
      .from("invoice_rooms")
      .select(
        `
        *,
        invoice_room_rates(*),
        invoice_food_services(*)
      `
      )
      .eq("invoice_id", invoiceData.id)
      .order("id");

    setRooms(roomData || []);
    setLoading(false);
  };

  /* ================= CALCULATIONS ================= */

  const roomCharges = (room) => {
    if (room.same_rate_all_nights) {
      return room.total_nights * Number(room.per_night_rate || 0);
    }
    return room.invoice_room_rates.reduce(
      (sum, r) => sum + Number(r.rate || 0),
      0
    );
  };

  const roomFoodTotal = (room) =>
    room.invoice_food_services.reduce(
      (sum, f) => sum + Number(f.total_amount || 0),
      0
    );

  const roomSubtotal = (room) => roomCharges(room) + roomFoodTotal(room);

  const invoiceSubtotal = rooms.reduce((sum, r) => sum + roomSubtotal(r), 0);

  const discountAmount =
    discountType === "percent"
      ? (invoiceSubtotal * Number(discountValue || 0)) / 100
      : Number(discountValue || 0);

  const taxableAmount = invoiceSubtotal - discountAmount;

  const gstAmount = invoice?.has_gst
    ? (taxableAmount * Number(invoice.gst_percentage || 0)) / 100
    : 0;

  const grandTotal = taxableAmount + gstAmount;

  if (loading) return <p>Loading invoice...</p>;
  if (!invoice || !hotel) return <p>Invoice not found</p>;

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <Link to="/dashboard/invoices/list">← Back to Invoices</Link>{" "}
      <button onClick={() => window.print()}>🖨️ Print / Download PDF</button>
      <style>{printStyles}</style>
      <h2 style={{ textAlign: "center", marginTop: 20 }}>Invoice</h2>
      <hr />
      {/* ================= HEADER ================= */}
      <div style={{ textAlign: "center" }}>
        {hotel.logo_url && <img src={hotel.logo_url} alt="Logo" height="80" />}
        <h2>{hotel.hotel_name}</h2>
        <p>{hotel.address}</p>
        <p>
          {hotel.phone} {hotel.email && ` | ${hotel.email}`}
        </p>

        {invoice.has_gst && (
          <p>
            <strong>GSTIN:</strong> {hotel.gst_number}
          </p>
        )}
      </div>
      <hr />
      {/* ================= INVOICE INFO ================= */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <p>
            <strong>Invoice No:</strong> {invoice.invoice_number}
          </p>
          <p>
            <strong>Date:</strong> {invoice.created_at?.split("T")[0]}
          </p>
        </div>

        <div>
          <p>
            <strong>Guest:</strong> {invoice.guest_name || "Guest"}
          </p>
          <p>
            <strong>Phone:</strong> {invoice.guest_phone || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {invoice.guest_email || "N/A"}{" "}
            {/* ✅ FIX: always show */}
          </p>
        </div>
      </div>
      <hr />
      {/* ================= ROOMS ================= */}
      {rooms.map((room, idx) => (
        <div key={room.id} style={{ marginBottom: 25 }}>
          <h4>
            Room {idx + 1}: {room.room_number} {room.room_name}
          </h4>
          <p>
            {room.checkin_date} → {room.checkout_date}
          </p>

          <table width="100%" border="1" cellPadding="8">
            <tbody>
              <tr>
                <td>Room Charges</td>
                <td align="right">₹{roomCharges(room)}</td>
              </tr>

              {room.invoice_food_services.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td align="right">₹{f.total_amount}</td>
                </tr>
              ))}

              <tr>
                <td>
                  <strong>Room Subtotal</strong>
                </td>
                <td align="right">
                  <strong>₹{roomSubtotal(room)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
      {/* ================= TOTALS ================= */}
      <hr />
      <table width="100%" cellPadding="8">
        <tbody>
          <tr>
            <td>Subtotal</td>
            <td align="right">₹{invoiceSubtotal}</td>
          </tr>

          <tr>
            <td>
              Discount
              <select
                value={discountType}
                disabled={isPaid}
                onChange={(e) => setDiscountType(e.target.value)}
                style={{ marginLeft: 10 }}
              >
                <option value="flat">₹</option>
                <option value="percent">%</option>
              </select>
              <input
                type="number"
                value={discountValue}
                disabled={isPaid}
                onChange={(e) => setDiscountValue(e.target.value)}
                style={{
                  width: 80,
                  marginLeft: 10,
                }}
              />
            </td>
            <td align="right">₹{discountAmount}</td>
          </tr>

          {invoice.has_gst && (
            <>
              <tr>
                <td>Taxable Amount</td>
                <td align="right">₹{taxableAmount}</td>
              </tr>
              <tr>
                <td>GST ({invoice.gst_percentage}%)</td>
                <td align="right">₹{gstAmount}</td>
              </tr>
            </>
          )}

          <tr>
            <td>
              <strong>Grand Total</strong>
            </td>
            <td align="right">
              <strong>₹{grandTotal}</strong>
            </td>
          </tr>

          <tr>
            <td>
              <strong>Payment Mode</strong>
            </td>
            <td align="right">{invoice.payment_mode}</td>
          </tr>
        </tbody>
      </table>
      {/* ================= PAYMENT ================= */}
      {!isPaid && (
        <>
          <hr />
          <h3>Payment</h3>

          {["Cash", "UPI", "Card", "Bank Transfer", "Online Booking (OTA)"].map(
            (mode) => (
              <label key={mode} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={paymentModes.includes(mode)}
                  onChange={() => togglePaymentMode(mode)}
                />{" "}
                {mode}
              </label>
            )
          )}

          <button
            style={{ marginTop: 20 }}
            disabled={paymentModes.length === 0}
            onClick={async () => {
              await finalizeInvoice({
                invoiceId: invoice.id,
                subtotal: invoiceSubtotal,
                discount_type: discountType,
                discount_value: discountValue,
                taxable_amount: hotel.has_gst ? taxableAmount : null,
                gst_amount: hotel.has_gst ? gstAmount : null,
                grand_total: grandTotal,
                payment_mode: paymentModes.join(", "),
                status: "Paid",
              });
              await loadInvoice();
              alert("Invoice marked as PAID");
            }}
          >
            Save & Mark as Paid
          </button>
        </>
      )}
      {isPaid && (
        <p style={{ marginTop: 20, color: "green" }}>✅ This invoice is PAID</p>
      )}
    </main>
  );
}

export default FinalInvoice;
