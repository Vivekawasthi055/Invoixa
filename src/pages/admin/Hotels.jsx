import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getAllHotels, toggleHotelStatus } from "../../services/adminService";

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

      <main>
        <h1>Hotels</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
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
                  <td>{hotel.hotel_code}</td>
                  <td>{hotel.hotel_name}</td>
                  <td>{hotel.email}</td>
                  <td>{hotel.phone}</td>
                  <td>{hotel.is_active ? "🟢 Active" : "🔴 Disabled"}</td>
                  <td>{hotel.delete_requested ? "⚠️ Yes" : "No"}</td>
                  <td>{new Date(hotel.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleToggle(hotel)}>
                      {hotel.is_active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}

export default Hotels;
