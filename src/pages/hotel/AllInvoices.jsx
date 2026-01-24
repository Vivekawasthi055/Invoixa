import { useEffect, useState } from "react";
import { searchInvoices } from "../../services/invoiceService";
import { useAuth } from "../../components/common/AuthContext";
import { supabase } from "../../services/supabaseClient";
import { Link } from "react-router-dom";
import "../../styles/allInvoices.css";

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

  // ✅ NEW: Clear filters & reload all invoices
  const clearSearch = () => {
    const clearedFilters = {
      invoice_number: "",
      guest_name: "",
      status: "",
      min_amount: "",
      max_amount: "",
      from_date: "",
      to_date: "",
    };

    setFilters(clearedFilters);

    searchInvoices({
      hotel_code: hotel.hotel_code,
      ...clearedFilters,
    }).then(({ data }) => setInvoices(data || []));
  };

  return (
    // 🔥 UPDATED: page-scoped wrapper
    <main className="allinvoices-page">
      <div className="allinvoices-header">
        <h2>All Invoices</h2>
        <p>Search & manage your hotel invoices</p>
      </div>

      {/* 🔍 FILTERS */}
      <div className="allinvoices-filter-card">
        <div className="allinvoices-filters-grid">
          <input
            name="invoice_number"
            placeholder="Invoice No"
            value={filters.invoice_number}
            onChange={handleChange}
          />
          <input
            name="guest_name"
            placeholder="Guest Name"
            value={filters.guest_name}
            onChange={handleChange}
          />
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="">Status</option>
            <option value="Draft">Draft</option>
            <option value="Paid">Paid</option>
            <option value="Void">Void</option>
          </select>

          <input
            name="from_date"
            type="date"
            value={filters.from_date}
            onChange={handleChange}
          />
          <input
            name="to_date"
            type="date"
            value={filters.to_date}
            onChange={handleChange}
          />

          <input
            name="min_amount"
            placeholder="Min Amount"
            value={filters.min_amount}
            onChange={handleChange}
          />
          <input
            name="max_amount"
            placeholder="Max Amount"
            value={filters.max_amount}
            onChange={handleChange}
          />
        </div>

        {/* ✅ UPDATED: scoped buttons */}
        <div className="allinvoices-filter-actions">
          <button className="allinvoices-search-btn" onClick={loadInvoices}>
            🔍 Search
          </button>

          <button className="allinvoices-clear-btn" onClick={clearSearch}>
            ❌ Clear
          </button>
        </div>
      </div>

      {/* 📄 TABLE */}
      <div className="allinvoices-table-wrapper">
        <table className="allinvoices-table">
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
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="6" className="allinvoices-empty-row">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.invoice_number}</td>
                  <td>{inv.guest_name || "-"}</td>
                  <td>{inv.created_at?.split("T")[0]}</td>
                  <td>
                    <span
                      className={`allinvoices-status ${
                        inv.status === "Paid"
                          ? "allinvoices-paid"
                          : inv.status === "Void"
                            ? "allinvoices-void"
                            : "allinvoices-draft"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td>₹{inv.grand_total}</td>
                  <td>
                    <Link
                      to={`/dashboard/invoices/${inv.id}`}
                      className="allinvoices-open-link"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default AllInvoices;
