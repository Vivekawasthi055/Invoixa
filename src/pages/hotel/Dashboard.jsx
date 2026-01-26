import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../components/common/AuthContext";
import { getProfile } from "../../services/profileService";
import { supabase } from "../../services/supabaseClient";
import "../../styles/dashboard.css";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hotelName, setHotelName] = useState("");
  const [hotelCode, setHotelCode] = useState("");
  const [hotelLogo, setHotelLogo] = useState(null);
  const [loadingHotel, setLoadingHotel] = useState(true);

  useEffect(() => {
    const init = async () => {
      // ✅ profile check
      const { data: profile } = await getProfile(user.id);

      if (!profile?.profile_completed) {
        navigate("/complete-profile", { replace: true });
        return;
      }

      // ✅ fetch hotel data
      const { data: hotel } = await supabase
        .from("hotels")
        .select("hotel_name, hotel_code, logo_url")
        .eq("user_id", user.id)
        .single();

      if (hotel) {
        setHotelName(hotel.hotel_name);
        setHotelCode(hotel.hotel_code);
        setHotelLogo(hotel.logo_url || null);
      }

      setLoadingHotel(false);
    };

    if (user?.id) init();
  }, [user, navigate]);

  return (
    <main className="db-page">
      {/* Header */}
      <div className="db-header">
        <h1>Hotel Dashboard</h1>
        <p>Manage invoices, rooms & hotel settings from one place</p>
      </div>

      {/* ✅ Hotel Info (DB header ke just neeche) */}
      <div style={{ marginBottom: "28px", display: "flex", gap: 14 }}>
        {loadingHotel ? (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                background: "#e5e7eb",
                borderRadius: 8,
              }}
            />
            <div>
              <div
                style={{
                  width: 220,
                  height: 18,
                  background: "#e5e7eb",
                  borderRadius: 4,
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  width: 80,
                  height: 12,
                  background: "#e5e7eb",
                  borderRadius: 4,
                }}
              />
            </div>
          </>
        ) : (
          <>
            {hotelLogo && (
              <img
                src={hotelLogo}
                alt="Hotel Logo"
                style={{
                  width: 56, // ✅ fixed width
                  height: 56,
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />
            )}

            <div>
              <strong style={{ fontSize: 18 }}>{hotelName}</strong>
              <div style={{ fontSize: 14, opacity: 0.7 }}>{hotelCode}</div>
            </div>
          </>
        )}
      </div>

      {/* Action Cards */}
      <div className="db-grid">
        <Link to="/dashboard/invoices/new" className="db-card db-card-primary">
          <h3>➕ Create Invoice</h3>
          <p>Generate a new bill for your guest</p>
        </Link>

        <Link to="/dashboard/invoices/list" className="db-card">
          <h3>📄 All Invoices</h3>
          <p>View & manage all generated invoices</p>
        </Link>

        <Link to="/dashboard/rooms" className="db-card">
          <h3>🛏 Rooms</h3>
          <p>Add rooms & manage availability</p>
        </Link>

        <Link to="/dashboard/profilesettings" className="db-card">
          <h3>⚙️ Profile & Settings</h3>
          <p>Hotel details, GST & preferences</p>
        </Link>
      </div>
    </main>
  );
}

export default Dashboard;
