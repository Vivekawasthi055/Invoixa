import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/common/AuthContext";
import {
  createInvoice,
  updateInvoiceGuest,
} from "../../services/invoiceService";
import InvoiceRooms from "./InvoiceRooms";

function CreateInvoice() {
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadHotel = async () => {
      const { data } = await supabase
        .from("hotels")
        .select("id, hotel_code, hotel_name, logo_url, address, email, phone")
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
      "generate_invoice_number"
    );

    if (invErr) {
      alert("Invoice number generate failed");
      return;
    }

    const { data, error } = await createInvoice({
      hotel_id: hotel.id,
      hotel_code: hotel.hotel_code,
      hotel_name: hotel.hotel_name,
      logo_url: hotel.logo_url,
      invoice_number: invoiceNumber,
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
    if (!guestName || !guestPhone) {
      alert("Please fill guest details");
      return;
    }
    await updateInvoiceGuest(invoice.id, {
      guest_name: guestName,     // ✅ FIX: object format
      guest_phone: guestPhone,   // ✅ FIX
      guest_email: guestEmail,   // ✅ FIX
    });

    navigate(`/dashboard/invoices/${invoice.id}`); // unchanged
  };

  if (!hotel) return <p>Loading...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h2>Create New Invoice</h2>

      {!invoice && (
        <button onClick={handleCreateInvoice}>Create Invoice</button>
      )}

      {invoice && (
        <>
          {/* ================= INVOICE HEADER ================= */}
          <div
            style={{
              borderBottom: "1px solid #ccc",
              marginBottom: 15,
              paddingBottom: 10,
            }}
          >
            {hotel.logo_url && (
              <img src={hotel.logo_url} alt="Logo" height="60" />
            )}

            <h3>{hotel.hotel_name}</h3>
            <p>{hotel.address}</p>
            <p>
              📧 {hotel.email} &nbsp; | &nbsp; 📞 {hotel.phone}
            </p>

            <p>
              <strong>Invoice No:</strong> {invoice.invoice_number}
            </p>
            <p>
              <strong>Date:</strong> {invoice.created_at?.split("T")[0]}
            </p>
          </div>

          {/* ================= GUEST DETAILS ================= */}
          <h4>Guest Details</h4>

          <input
            placeholder="Guest Name *"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            style={{ display: "block", marginBottom: 8 }}
          />

          <input
            placeholder="Guest Phone *"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            style={{ display: "block", marginBottom: 8 }}
          />

          <input
            placeholder="Guest Email (optional)"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            style={{ display: "block", marginBottom: 8 }}
          />

          <hr />

          {/* ================= ROOMS + FOOD ================= */}
          <InvoiceRooms invoice={invoice} />

          {/* ================= SAVE & NEXT ================= */}
          <button
            style={{
              marginTop: 30,
              padding: "10px 20px",
              fontSize: 16,
            }}
            onClick={handleSaveAndPrint}
          >
            Save & Next
          </button>

          <p>
            Note : You can't edit the invoice after click on Save & Next Button
          </p>
        </>
      )}
    </main>
  );
}

export default CreateInvoice;
