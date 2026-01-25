import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { finalizeInvoice } from "../../services/invoiceService";
import "../../styles/FinalInvoice.css";

function FinalInvoice() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);

  // const [hotel, setHotel] = useState(null);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paymentModes, setPaymentModes] = useState([]);

  /* ================= DISCOUNT ================= */
  const [discountType, setDiscountType] = useState("flat");
  const [discountValue, setDiscountValue] = useState(0);
  const [showDraftPopup, setShowDraftPopup] = useState(false);

  const isPaid = invoice?.status === "Paid";
  const isVoid = invoice?.status === "Void";
  const isDraft = invoice?.status === "Draft";

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const togglePaymentMode = (mode) => {
    setPaymentModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  const handleDeleteInvoice = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to DELETE this invoice?\nThis will permanently remove all rooms and food services.",
    );

    if (!confirmDelete) return;

    // 1️⃣ get all room ids
    const { data: roomsData } = await supabase
      .from("invoice_rooms")
      .select("id")
      .eq("invoice_id", invoice.id);

    const roomIds = roomsData?.map((r) => r.id) || [];

    // 2️⃣ delete food services & room rates
    if (roomIds.length > 0) {
      await supabase
        .from("invoice_food_services")
        .delete()
        .in("invoice_room_id", roomIds);

      await supabase
        .from("invoice_room_rates")
        .delete()
        .in("invoice_room_id", roomIds);
    }

    // 3️⃣ delete rooms
    await supabase.from("invoice_rooms").delete().eq("invoice_id", invoice.id);

    // 4️⃣ delete invoice
    await supabase.from("invoices").delete().eq("id", invoice.id);

    alert("Invoice deleted successfully");

    window.location.href = "/dashboard/invoices/list";
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

    const { data: roomData } = await supabase
      .from("invoice_rooms")
      .select(
        `
        *,
        invoice_room_rates(*),
        invoice_food_services(*)
      `,
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
      0,
    );
  };

  const roomFoodTotal = (room) =>
    room.invoice_food_services.reduce(
      (sum, f) => sum + Number(f.total_amount || 0),
      0,
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

  if (loading)
    return (
      <main className="all-pages">
        <div className="all-pages-loading-card">
          <div className="all-pages-spinner"></div>
          <p className="loading-title">Loading invoice…</p>
        </div>
      </main>
    );
  if (!invoice || !invoice) return <p>Invoice not found</p>;
  return (
    <main className="final-inv-main">
      {/* ✅ DRAFT POPUP */}
      {showDraftPopup && (
        <div className="final-inv-draft-popup">
          📝 Invoice saved as Draft. Redirecting…
        </div>
      )}

      {isDraft && (
        <div className="final-inv-draft-watermark">DRAFT</div>
      )}
      {isVoid && <div className="final-inv-void-watermark">VOID</div>}

      <div className="final-inv-top-actions">
        <Link to="/dashboard/invoices/list">← Back to Invoices</Link>

        <div>
          <button
            onClick={() => {
              const guestName =
                invoice.guest_name?.trim().replace(/\s+/g, "_") || "invoice";

              const originalTitle = document.title;
              document.title = `${guestName}_invoice`;

              window.print();

              setTimeout(() => {
                document.title = originalTitle;
              }, 1000);
            }}
          >
            🖨️ Print / Download PDF
          </button>

          {isDraft && (
            <button
              className="final-inv-delete-btn"
              onClick={handleDeleteInvoice}
            >
              🗑️ Delete Invoice
            </button>
          )}

          {!isVoid && (
            <button
              className="final-inv-void-btn"
              onClick={async () => {
                const confirmVoid = window.confirm(
                  "Are you sure you want to VOID this invoice? This action cannot be undone.",
                );
                if (!confirmVoid) return;

                await supabase
                  .from("invoices")
                  .update({ status: "Void" })
                  .eq("id", invoice.id);

                await loadInvoice();
                alert("Invoice has been VOIDED");
              }}
            >
              🚫 Void Invoice
            </button>
          )}
        </div>
      </div>

      <h2 className="final-inv-title">Invoice</h2>
      <hr />

      {/* HEADER */}
      <div className="final-inv-header-row">
        <p>
          <strong>Invoice No:</strong> {invoice.invoice_number}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {invoice.created_at
            ? new Date(invoice.created_at).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "medium",
                timeStyle: "short",
              })
            : ""}
        </p>
      </div>

      <div className="final-inv-hotel">
        {invoice.hotel_logo_url && (
          <img src={invoice.hotel_logo_url} alt="Logo" />
        )}
        <h2>{invoice.hotel_name}</h2>
        <p>
          {invoice.hotel_address} | {invoice.hotel_phone} |{" "}
          {invoice.hotel_email}
        </p>

        {invoice.has_gst && (
          <p>
            <strong>GSTIN:</strong> {invoice.gst_number}
          </p>
        )}
      </div>

      <hr />

      {/* GUEST */}
      <div className="final-inv-guest">
        <strong>Guest Details</strong>
        <div>
          <p>
            <strong>Name:</strong> {invoice.guest_name || "Guest"}
          </p>
          <p>
            <strong>Phone:</strong> {invoice.guest_phone || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {invoice.guest_email || "N/A"}
          </p>
        </div>
      </div>

      <hr />

      {/* ROOMS */}
      {rooms.map((room, idx) => (
        <div key={room.id} className="final-inv-room">
          <h4>
            Room {idx + 1}: {room.room_number} {room.room_name}
          </h4>
          <p>
            {room.checkin_date} → {room.checkout_date}
          </p>

          <table>
            <tbody>
              <tr>
                <td>
                  Room Charges
                  {!room.same_rate_all_nights && (
                    <div className="final-inv-night-rates">
                      {room.invoice_room_rates
                        .map((r, idx) => `Night ${idx + 1} ₹${r.rate}`)
                        .join(", ")}
                    </div>
                  )}
                </td>
                <td className="right">₹{roomCharges(room)}</td>
              </tr>

              {room.invoice_food_services.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td className="right">₹{f.total_amount}</td>
                </tr>
              ))}

              <tr className="final-inv-subtotal">
                <td>Room Subtotal</td>
                <td className="right">₹{roomSubtotal(room)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      <hr />

      {/* TOTALS */}
      <table className="final-inv-totals">
        <tbody>
          <tr>
            <td>Subtotal</td>
            <td className="right">₹{invoiceSubtotal}</td>
          </tr>

          <tr>
            <td>
              Discount
              <select
                value={discountType}
                disabled={isPaid || isVoid}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value="flat">₹</option>
                <option value="percent">%</option>
              </select>
              <input
                type="number"
                value={discountValue}
                disabled={isPaid || isVoid}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </td>
            <td className="right">₹{discountAmount}</td>
          </tr>

          {invoice.has_gst && (
            <>
              <tr>
                <td>Taxable Amount</td>
                <td className="right">₹{taxableAmount}</td>
              </tr>
              <tr>
                <td>GST ({invoice.gst_percentage}%)</td>
                <td className="right">₹{gstAmount}</td>
              </tr>
            </>
          )}

          <tr className="final-inv-grand">
            <td>Grand Total</td>
            <td className="right">₹{grandTotal}</td>
          </tr>

          <tr>
            <td>Payment Mode</td>
            <td className="right">{invoice.payment_mode}</td>
          </tr>
        </tbody>
      </table>

      {!isPaid && !isVoid && (
        <>
          <hr />
          <h3>Payment</h3>

          {["Cash", "UPI", "Card", "Bank Transfer", "Online Booking (OTA)"].map(
            (mode) => (
              <label key={mode} className="final-inv-payment-option">
                <input
                  type="checkbox"
                  checked={paymentModes.includes(mode)}
                  onChange={() => togglePaymentMode(mode)}
                />
                {mode}
              </label>
            ),
          )}

          <button
            className={`final-inv-paid-btn ${
              paymentModes.length === 0 ? "btn-disabled" : "btn-active"
            }`}
            disabled={paymentModes.length === 0}
            onClick={async () => {
              await finalizeInvoice({
                invoiceId: invoice.id,
                subtotal: invoiceSubtotal,
                discount_type: discountType,
                discount_value: discountValue,
                taxable_amount: invoice.has_gst ? taxableAmount : null,
                gst_amount: invoice.has_gst ? gstAmount : null,
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

      {isPaid && <p className="final-inv-paid">✅ This invoice is PAID</p>}
      {isDraft && (
        <p className="final-inv-draft">
          📝 This invoice is currently DRAFT / UNPAID
        </p>
      )}
      {isVoid && (
        <p className="final-inv-void">🚫 This invoice has been VOIDED</p>
      )}

      {!isPaid && !isVoid && (
        <button
          className="final-inv-draft-btn"
          onClick={() => {
            setShowDraftPopup(true);
            setTimeout(() => {
              window.location.href = "/dashboard/invoices/list";
            }, 2500);
          }}
        >
          📝 Leave as Draft / Unpaid
        </button>
      )}

      <hr />

      {/* SIGNATURE */}
      <div className="final-inv-signature">
        <strong>Authorized Signature</strong>

        {invoice.hotel_signature_url && (
          <img src={invoice.hotel_signature_url} alt="Hotel Signature" />
        )}

        <p>{invoice.hotel_name}</p>
      </div>

      <hr />
      <footer className="final-inv-footer">
        Powered by INVOIXA – complete invoice management platform{" "}
        <a href="https://invoixa.qzz.io" target="_blank" rel="noreferrer">
          www.invoixa.qzz.io
        </a>
      </footer>
    </main>
  );
}

export default FinalInvoice;
