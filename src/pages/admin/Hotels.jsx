import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  getAllHotels,
  toggleHotelStatus,
  clearHotelCompleteData,
} from "../../services/adminService";
import "./styles/hotels.css"; // ✅ UI only

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [filteredHotels, setFilteredHotels] = useState([]);

  useEffect(() => {
    async function fetchHotels() {
      const { data } = await getAllHotels();
      if (data) setHotels(data);
      setFilteredHotels(data);
      setLoading(false);
    }
    fetchHotels();
  }, []);

  const handleSearch = () => {
    let result = hotels;

    if (searchName.trim()) {
      result = result.filter((h) =>
        h.hotel_name?.toLowerCase().includes(searchName.trim().toLowerCase()),
      );
    }

    if (searchCode.trim()) {
      result = result.filter((h) =>
        h.hotel_code?.toLowerCase().includes(searchCode.trim().toLowerCase()),
      );
    }

    setFilteredHotels(result);
  };

  const handleClear = () => {
    setSearchName("");
    setSearchCode("");
    setFilteredHotels(hotels);
  };

  const handleToggle = async (hotel) => {
    await toggleHotelStatus({
      hotel_id: hotel.id,
      is_active: !hotel.is_active,
    });

    setHotels((prev) =>
      prev.map((h) =>
        h.id === hotel.id ? { ...h, is_active: !h.is_active } : h,
      ),
    );
  };

  const handleClearHotelData = async (hotel) => {
    const confirm = window.confirm(
      `⚠️ WARNING!\n\nThis will permanently DELETE all data of hotel:\n${hotel.hotel_name}\n\nInvoices, Rooms, Food, Rates etc.\n\nAre you sure?`,
    );

    if (!confirm) return;

    const { error } = await clearHotelCompleteData(hotel.id);

    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }

    alert("Hotel data cleared successfully");
  };

  return (
    <>
      <Helmet>
        <title>Hotels List – Admin | Invoixa</title>
      </Helmet>

      <main className="admin-hotels-page">
        {/* Header */}
        <div className="admin-hotels-header">
          <h1 className="admin-hotels-title">Hotels</h1>
          <p className="admin-hotels-subtitle">
            Manage registered hotels & access status
          </p>
        </div>

        <div className="admin-hotels-search">
          <h2 className="admin-hotels-search-title">Search Hotel</h2>

          <label htmlFor="search-hotel-code">
            Hotel Code
            <input
              id="search-hotel-code"
              name="hotel_code"
              type="text"
              placeholder="Search by Hotel Code"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              autoComplete="off"
            />
          </label>

          <label htmlFor="search-hotel-name">
            Hotel Name
            <input
              id="search-hotel-name"
              name="hotel_name"
              type="text"
              placeholder="Search by Hotel Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              autoComplete="off"
            />
          </label>

          <button onClick={handleSearch}>Search</button>
          <button onClick={handleClear} className="outline">
            Clear
          </button>
        </div>

        {loading ? (
          <div className="admin-hotels-loading">Loading hotels...</div>
        ) : (
          <div className="admin-hotels-table-wrapper">
            <table className="admin-hotels-table">
              <thead>
                <tr>
                  <th>Hotel Code</th>
                  <th>Hotel</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Delete Req</th>
                  <th>Created</th>
                  <th>Action</th>
                  <th>Danger Zone</th>
                </tr>
              </thead>

              <tbody>
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td className="admin-hotels-mono">{hotel.hotel_code}</td>
                    <td>
                      <strong>{hotel.hotel_name}</strong>
                    </td>
                    <td>{hotel.email}</td>
                    <td>{hotel.phone}</td>
                    <td>
                      <span
                        className={
                          hotel.is_active
                            ? "admin-hotels-badge active"
                            : "admin-hotels-badge disabled"
                        }
                      >
                        {hotel.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      {hotel.delete_requested ? (
                        <span className="admin-hotels-badge warning">Yes</span>
                      ) : (
                        "No"
                      )}
                    </td>
                    <td>{new Date(hotel.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={
                          hotel.is_active
                            ? "admin-hotels-action danger"
                            : "admin-hotels-action success"
                        }
                        onClick={() => handleToggle(hotel)}
                      >
                        {hotel.is_active ? "Disable" : "Enable"}
                      </button>
                    </td>
                    <td>
                      <button
                        className="admin-hotels-action danger-outline"
                        onClick={() => handleClearHotelData(hotel)}
                      >
                        Clear Hotel Data
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredHotels.length === 0 && (
              <p className="admin-hotels-empty">No hotels found</p>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default Hotels;
