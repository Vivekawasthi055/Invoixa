import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getAllHotels, toggleHotelStatus } from "../../services/adminService";
import "../../styles/hotels.css"; // ✅ UI only

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotels() {
      const { data } = await getAllHotels();
      if (data) setHotels(data);
      setLoading(false);
    }
    fetchHotels();
  }, []);

  const handleToggle = async (hotel) => {
    await toggleHotelStatus({
      hotel_id: hotel.id,
      is_active: !hotel.is_active,
    });

    setHotels((prev) =>
      prev.map((h) =>
        h.id === hotel.id ? { ...h, is_active: !h.is_active } : h
      )
    );
  };

  return (
    <>
      <Helmet>
        <title>Hotels – Admin | Invoixa</title>
      </Helmet>

      <main className="hotels-page">
        <div className="hotels-header">
          <h1>Hotels</h1>
          <p>Manage registered hotels & access status</p>
        </div>

        {loading ? (
          <div className="loading-box">Loading hotels...</div>
        ) : (
          <div className="table-wrapper">
            <table className="hotels-table">
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
                </tr>
              </thead>

              <tbody>
                {hotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td className="mono">{hotel.hotel_code}</td>
                    <td>
                      <strong>{hotel.hotel_name}</strong>
                    </td>
                    <td>{hotel.email}</td>
                    <td>{hotel.phone}</td>
                    <td>
                      <span
                        className={
                          hotel.is_active ? "badge active" : "badge disabled"
                        }
                      >
                        {hotel.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      {hotel.delete_requested ? (
                        <span className="badge warning">Yes</span>
                      ) : (
                        "No"
                      )}
                    </td>
                    <td>{new Date(hotel.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className={
                          hotel.is_active
                            ? "action-btn danger"
                            : "action-btn success"
                        }
                        onClick={() => handleToggle(hotel)}
                      >
                        {hotel.is_active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hotels.length === 0 && (
              <p className="empty-text">No hotels found</p>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default Hotels;
