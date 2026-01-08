import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../components/common/AuthContext";
import { createInvoice } from "../../services/invoiceService";

function Invoices() {
  const { user } = useAuth();

  const [hotel, setHotel] = useState(null); // ✅ NEW
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Load hotel + invoices
  const loadData = async () => {
    setLoading(true);

    // ✅ Load hotel details
    // Load hotel details
    const { data: hotelData, error: hotelError } = await supabase
      .from("hotels")
      .select("id, hotel_code, hotel_name, logo_url") // ✅ id added
      .eq("user_id", user.id)
      .single();

    if (hotelError) {
      alert("Hotel data not found");
      setLoading(false);
      return;
    }

    setHotel(hotelData);

    // ✅ Load invoices
    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("*")
      .eq("hotel_id", user.id)
      .order("created_at", { ascending: false });

    setInvoices(invoiceData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // 🔹 Create Invoice (ONLY invoice master)
  const handleCreateInvoice = async () => {
    if (!hotel) return alert("Hotel not loaded");

    const invoiceNumber = `INV-${Date.now()}`;

    const { data, error } = await createInvoice({
      hotel_id: hotel.id,
      hotel_code: hotel.hotel_code,
      hotel_name: hotel.hotel_name,
      logo_url: hotel.logo_url,
      invoice_number: invoiceNumber,
      guest_name: "Guest",
    });

    if (error) {
      alert("Failed to create invoice");
      return;
    }

    setSelectedInvoice(data);
    loadData();
  };

  if (loading) return <p>Loading invoices...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1>Invoices</h1>

      {/* CREATE INVOICE */}
      <button onClick={handleCreateInvoice}>Create New Invoice</button>

      <hr />

      <div style={{ display: "flex", gap: 30 }}>
        {/* INVOICE LIST */}
        <ul style={{ width: "40%" }}>
          {invoices.map((inv) => (
            <li
              key={inv.id}
              style={{
                cursor: "pointer",
                fontWeight: selectedInvoice?.id === inv.id ? "bold" : "normal",
              }}
              onClick={() => setSelectedInvoice(inv)}
            >
              {inv.invoice_number}
            </li>
          ))}
        </ul>

        {/* INVOICE DETAILS */}
        {selectedInvoice && (
          <div style={{ width: "60%" }}>
            <h3>Invoice Details</h3>

            <p>
              <strong>Invoice No:</strong> {selectedInvoice.invoice_number}
            </p>

            <p>
              <strong>Hotel:</strong> {selectedInvoice.hotel_name}
            </p>

            <p>
              <strong>Status:</strong> {selectedInvoice.status || "Draft"}
            </p>

            <hr />

            <p>
              👉 <strong>Next Step:</strong> Add Rooms to this invoice
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Invoices;
