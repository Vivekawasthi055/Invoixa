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
      <div className="db-hotel-header">
        {loadingHotel ? (
          <>
            <div className="db-hotel-logo-skeleton" />

            <div className="db-hotel-text-skeleton">
              <div className="db-hotel-name-skeleton" />
              <div className="db-hotel-code-skeleton" />
            </div>
          </>
        ) : (
          <>
            {hotelLogo && (
              <img src={hotelLogo} alt="Hotel Logo" className="db-hotel-logo" />
            )}

            <div className="db-hotel-text">
              <strong className="db-hotel-name">{hotelName}</strong>
              <div className="db-hotel-code">Hotel Code: {hotelCode}</div>
            </div>
          </>
        )}
      </div>

      {/* Action Cards */}
      <div className="db-grid">
        <Link to="/hotel/invoices/new" className="db-card db-card-primary">
          <h3>➕ Create Invoice</h3>
          <p>Generate a new bill for your guest</p>
        </Link>

        <Link to="/hotel/invoices/list" className="db-card">
          <h3>📄 All Invoices</h3>
          <p>View & manage all generated invoices</p>
        </Link>

        <Link to="/hotel/rooms" className="db-card">
          <h3>🛏 Rooms</h3>
          <p>Add rooms & manage availability</p>
        </Link>

        <Link to="/hotel/profilesettings" className="db-card">
          <h3>⚙️ Profile & Settings</h3>
          <p>Hotel details, GST & preferences</p>
        </Link>
      </div>
    </main>
  );
}

export default Dashboard;
