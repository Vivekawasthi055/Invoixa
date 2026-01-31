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
  const [invoicesLoading, setInvoicesLoading] = useState(true);

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
    setInvoicesLoading(true); // ✅ START loading

    const { data } = await searchInvoices({
      hotel_code: hotel.hotel_code,
      ...filters,
    });

    setInvoices(data || []);
    setInvoicesLoading(false); // ✅ END loading
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
          <div className="allinvoices-filter-field">
            <label>Invoice No</label>
            <input
              name="invoice_number"
              placeholder="e.g. INV-1023"
              value={filters.invoice_number}
              onChange={handleChange}
            />
          </div>

          <div className="allinvoices-filter-field">
            <label>Guest Name</label>
            <input
              name="guest_name"
              placeholder="Guest name"
              value={filters.guest_name}
              onChange={handleChange}
            />
          </div>

          <div className="allinvoices-filter-field">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
            >
              <option value="">All</option>
              <option value="Draft">Draft</option>
              <option value="Paid">Paid</option>
              <option value="Void">Void</option>
            </select>
          </div>

          <div className="allinvoices-filter-field">
            <label>From Date</label>
            <input
              type="date"
              name="from_date"
              value={filters.from_date}
              onChange={handleChange}
            />
          </div>

          <div className="allinvoices-filter-field">
            <label>To Date</label>
            <input
              type="date"
              name="to_date"
              value={filters.to_date}
              onChange={handleChange}
            />
          </div>

          <div className="allinvoices-filter-field">
            <label>Min Amount</label>
            <input
              name="min_amount"
              placeholder="₹ Min"
              value={filters.min_amount}
              onChange={handleChange}
            />
          </div>

          <div className="allinvoices-filter-field">
            <label>Max Amount</label>
            <input
              name="max_amount"
              placeholder="₹ Max"
              value={filters.max_amount}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Actions */}
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
            {invoicesLoading ? (
              <tr>
                <td colSpan="6" className="allinvoices-empty-row loading">
                  Loading Invoices…
                </td>
              </tr>
            ) : invoices.length === 0 ? (
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
                      to={`/hotel/invoices/${inv.id}`}
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
