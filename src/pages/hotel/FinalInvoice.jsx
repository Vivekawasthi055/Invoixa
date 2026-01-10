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

  // 🔹 DISCOUNT / GST
  const [discountType, setDiscountType] = useState("flat"); // flat | percent
  const [discountValue, setDiscountValue] = useState(0);

  const isPaid = invoice?.status === "Paid";

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const togglePaymentMode = (mode) => {
    setPaymentModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const loadInvoice = async () => {
    setLoading(true);

    // 1️⃣ Invoice
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

    // 2️⃣ Hotel
    const { data: hotelData } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", invoiceData.hotel_id)
      .single();

    setHotel(hotelData);

    // 3️⃣ Rooms + rates + food
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
      ? (invoiceSubtotal * discountValue) / 100
      : Number(discountValue || 0);

  const taxableAmount = invoiceSubtotal - discountAmount;

  const gstAmount = hotel?.gst_enabled
    ? (taxableAmount * hotel.gst_percent) / 100
    : 0;

  const grandTotal = taxableAmount + gstAmount;

  if (loading) return <p>Loading invoice...</p>;
  if (!invoice || !hotel) return <p>Invoice not found</p>;

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <Link to="/dashboard/invoices/list">← Back to Invoices</Link>
      <span> || </span>
      <button
        onClick={() => window.print()}
        style={{
          marginTop: 10,
          padding: "6px 14px",
          cursor: "pointer",
        }}
      >
        🖨️ Print / Download PDF
      </button>

      {/* ================= HEADER ================= */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        {hotel.logo_url && <img src={hotel.logo_url} alt="Logo" height="80" />}
        <h2>{hotel.hotel_name}</h2>
        <p>{hotel.address}</p>
        <p>
          {hotel.phone} {hotel.email && ` | ${hotel.email}`}
        </p>
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
            <strong>Guest:</strong> {invoice.guest_name}
          </p>
          <p>
            <strong>Phone:</strong> {invoice.guest_phone}
          </p>
          {invoice.guest_email && (
            <p>
              <strong>Email:</strong> {invoice.guest_email}
            </p>
          )}
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
                <td>
                  <strong>Room Charges</strong>
                </td>
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
                onChange={(e) => setDiscountType(e.target.value)}
                disabled={isPaid}
                style={{ marginLeft: 10 }}
              >
                <option value="flat">₹</option>
                <option value="percent">%</option>
              </select>
            </td>
            <td align="right">
              <input
                type="number"
                value={discountValue}
                disabled={isPaid}
                onChange={(e) => setDiscountValue(e.target.value)}
                style={{ width: 80 }}
              />
            </td>
          </tr>

          <tr>
            <td>Taxable Amount</td>
            <td align="right">₹{taxableAmount}</td>
          </tr>

          {hotel.gst_enabled && (
            <tr>
              <td>GST ({hotel.gst_percent}%)</td>
              <td align="right">₹{gstAmount}</td>
            </tr>
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
              <strong>Payment Mode:</strong>
            </td>{" "}
            <td align="right">{invoice.payment_mode}</td>
          </tr>
        </tbody>
      </table>
      {invoice.payment_mode && <p></p>}

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

          <br />

          <button
            style={{ marginTop: 20 }}
            disabled={paymentModes.length === 0}
            onClick={async () => {
              await finalizeInvoice({
                invoiceId: invoice.id,
                subtotal: invoiceSubtotal,
                discount_type: discountType,
                discount_value: discountValue,
                taxable_amount: taxableAmount,
                gst_amount: gstAmount,
                grand_total: grandTotal,
                payment_mode: paymentModes.join(", "),
                status: "Paid",
              });
              await loadInvoice(); // ✅ ADD THIS
              alert("Invoice marked as PAID");
              loadInvoice();
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
