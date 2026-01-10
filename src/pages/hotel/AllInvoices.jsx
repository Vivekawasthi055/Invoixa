import { useEffect, useState } from "react";
import { searchInvoices } from "../../services/invoiceService";
import { useAuth } from "../../components/common/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { Link } from "react-router-dom";

function AllInvoices() {
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [invoices, setInvoices] = useState([]);

  const [filters, setFilters] = useState({
    invoice_number: "",
    guest_name: "",
    status: "",
    min_amount: "",
    max_amount: "",
    from_date: "",
    to_date: "",
  });

  useEffect(() => {
    const loadHotel = async () => {
      const { data } = await supabase
        .from("hotels")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setHotel(data);
    };
    if (user) loadHotel();
  }, [user]);

  useEffect(() => {
    if (hotel) loadInvoices();
  }, [hotel]);

  const loadInvoices = async () => {
    const { data } = await searchInvoices({
      hotel_code: hotel.hotel_code,
      ...filters,
    });

    setInvoices(data || []);
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <main style={{ padding: 20 }}>
      <h2>All Invoices</h2>

      {/* 🔍 FILTERS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        <input
          name="invoice_number"
          placeholder="Invoice No"
          onChange={handleChange}
        />
        <input
          name="guest_name"
          placeholder="Guest Name"
          onChange={handleChange}
        />
        <select name="status" onChange={handleChange}>
          <option value="">Status</option>
          <option value="Draft">Draft</option>
          <option value="Paid">Paid</option>
        </select>

        <input name="from_date" type="date" onChange={handleChange} />
        <input name="to_date" type="date" onChange={handleChange} />

        <input
          name="min_amount"
          placeholder="Min Amount"
          onChange={handleChange}
        />
        <input
          name="max_amount"
          placeholder="Max Amount"
          onChange={handleChange}
        />
      </div>

      <button onClick={loadInvoices} style={{ marginTop: 10 }}>
        Search
      </button>

      {/* 📄 INVOICE LIST */}
      <table
        border="1"
        cellPadding="8"
        style={{ marginTop: 20, width: "100%" }}
      >
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Guest</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Open</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoice_number}</td>
              <td>{inv.guest_name || "-"}</td>
              <td>{inv.created_at?.split("T")[0]}</td>
              <td>{inv.status}</td>
              {/* ✅ FIXED HERE */}
              <td>₹{inv.grand_total}</td>
              <td>
                <Link to={`/dashboard/invoices/${inv.id}`}>Open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default AllInvoices;
