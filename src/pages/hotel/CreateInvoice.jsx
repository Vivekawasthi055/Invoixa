import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/common/AuthContext";
import {
  createInvoice,
  updateInvoiceGuest,
} from "../../services/invoiceService";
import InvoiceRooms from "./InvoiceRooms";
import "../../styles/CreateInvoice.css";

function CreateInvoice() {
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [canProceed, setCanProceed] = useState(false);
  const [showAdditionalGuest, setShowAdditionalGuest] = useState(false);
  const [additionalGuestName, setAdditionalGuestName] = useState("");
  const [guestGSTIN, setGuestGSTIN] = useState("");
  const [showDeleteRule, setShowDeleteRule] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadHotel = async () => {
      const { data } = await supabase
        .from("hotels")
        .select(
          "id, hotel_code, hotel_name, logo_url, address, email, phone, has_gst, gst_percentage",
        ) // ✅ GST fields added
        .eq("user_id", user.id)
        .single();

      setHotel(data);
    };

    if (user) loadHotel();
  }, [user]);

  /* ================= CREATE INVOICE ================= */

  const handleCreateInvoice = async () => {
    // ✅ Generate invoice number from DB
    const { data: invoiceNumber, error: invErr } = await supabase.rpc(
      "generate_invoice_number",
    );

    if (invErr) {
      alert("Invoice number generate failed");
      return;
    }

    // 🔒 STEP-1: Added snapshot fields only

    const { data, error } = await createInvoice({
      hotel_id: hotel.id,
      hotel_code: hotel.hotel_code,

      // 🔒 HOTEL SNAPSHOT (LOCKED)
      hotel_name: hotel.hotel_name,
      hotel_address: hotel.address,
      hotel_email: hotel.email,
      hotel_phone: hotel.phone,
      hotel_logo_url: hotel.logo_url,

      invoice_number: invoiceNumber,

      // 🔒 GST SNAPSHOT
      has_gst: hotel.has_gst,
      gst_percentage: hotel.gst_percentage,
      gst_type: hotel.gst_type || "cgst_sgst",
    });

    if (error) {
      alert("Invoice create failed");
      return;
    }

    setInvoice(data);
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
  };

  /* ================= SAVE & NEXT ================= */

  const handleSaveAndPrint = async () => {
    if (!canProceed) {
      alert("Please add room and food properly before proceeding");
      return;
    }
    if (!guestName || !guestPhone) {
      alert("Please fill guest details");
      return;
    }
    await updateInvoiceGuest(invoice.id, {
      guest_name: guestName, // ✅ FIX: object format
      guest_phone: guestPhone, // ✅ FIX
      guest_email: guestEmail, // ✅ FIX

      guest_additional_name: additionalGuestName || null,
      guest_gstin: guestGSTIN || null,
    });

    navigate(`/hotel/invoices/${invoice.id}`); // unchanged
  };

  if (!hotel)
    return (
      <main className="all-pages">
        <div className="all-pages-loading-card">
          <div className="all-pages-spinner"></div>
          <p className="loading-title">Opening…</p>
          <p className="loading-sub">Please wait a moment</p>
        </div>
      </main>
    );
  return (
    <main className="ci-main">
      <h2 className="ci-page-title">Create New Invoice</h2>

      {!invoice && (
        <button className="ci-create-btn" onClick={handleCreateInvoice}>
          + Create Invoice
        </button>
      )}

      {invoice && (
        <>
          {/* ================= INVOICE HEADER ================= */}
          <section className="ci-card ci-header">
            {hotel.logo_url && (
              <img src={hotel.logo_url} alt="Logo" className="ci-hotel-logo" />
            )}

            <div className="ci-hotel-info">
              <h3>{hotel.hotel_name}</h3>
              <p>{hotel.address}</p>
              <p className="ci-contact">
                📧 {hotel.email} <span>|</span> 📞 {hotel.phone}
              </p>
            </div>

            <div className="ci-invoice-meta">
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
          </section>

          {invoice && showDeleteRule && (
            <section className="ci-card ci-warning-card">
              <button
                className="ci-warning-close"
                onClick={() => setShowDeleteRule(false)}
                aria-label="Close"
              >
                ✕
              </button>

              <p className="ci-final-title">⚠️ Final Submission Warning</p>

              <p className="ci-final-text">
                <strong>English:</strong> Once you click <b>Save & Next</b>,
                this invoice will be locked for editing. Please carefully verify
                guest details, rooms, dates, rates, and taxes before proceeding.
              </p>

              <p className="ci-final-text">
                <strong>हिंदी:</strong> <b>Save & Next</b> पर क्लिक करने के बाद
                यह इनवॉइस एडिट के लिए लॉक हो जाएगा। आगे बढ़ने से पहले कृपया
                मेहमान की जानकारी, कमरे, तारीखें, रेट और टैक्स अच्छी तरह जाँच
                लें।
              </p>
            </section>
          )}

          {/* ================= GUEST DETAILS ================= */}
          <section className="ci-card">
            <h4 className="ci-section-title">Guest Details</h4>

            <div className="ci-form-grid">
              <div>
                <label>Guest Name</label>
                <input
                  placeholder="Guest Name *"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div>
                <label>Guest Phone</label>
                <input
                  placeholder="Guest Phone *"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>

              <div>
                <label>Guest Email</label>
                <input
                  placeholder="Guest Email (optional)"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>
            </div>
            <label className="ci-checkbox">
              <input
                type="checkbox"
                checked={showAdditionalGuest}
                onChange={(e) => setShowAdditionalGuest(e.target.checked)}
              />
              <span>Add Additional Guest / GST Details</span>
            </label>

            {showAdditionalGuest && (
              <div className="ci-form-grid">
                <div>
                  <label>Additional Name (optional)</label>
                  <input
                    placeholder="Additional Guest / Company Name"
                    value={additionalGuestName}
                    onChange={(e) => setAdditionalGuestName(e.target.value)}
                  />
                </div>

                <div>
                  <label>GSTIN (optional)</label>
                  <input
                    placeholder="GSTIN"
                    value={guestGSTIN}
                    onChange={(e) => setGuestGSTIN(e.target.value)}
                  />
                </div>
              </div>
            )}
          </section>

          {/* ================= ROOMS + FOOD ================= */}
          <InvoiceRooms
            invoice={invoice}
            onValidationChange={(canProceed) => setCanProceed(canProceed)}
          />

          {/* ================= ACTION ================= */}
          <section className="ci-footer-action">
            <button
              className="ci-primary-btn"
              onClick={handleSaveAndPrint}
              disabled={!canProceed}
            >
              Save & Next →
            </button>
          </section>
        </>
      )}
    </main>
  );
}

export default CreateInvoice;
