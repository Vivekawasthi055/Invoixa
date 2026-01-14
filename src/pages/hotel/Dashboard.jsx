import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../components/common/AuthContext";
import { getProfile } from "../../services/profileService";
import "../../styles/dashboard.css"; // ✅ UI only

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      const { data } = await getProfile(user.id);
      if (!data.profile_completed) {
        navigate("/complete-profile", { replace: true });
      }
    };
    checkProfile();
  }, []);

  return (
    <main className="db-page">
      {/* Header */}
      <div className="db-header">
        <h1>Hotel Dashboard</h1>
        <p>Manage invoices, rooms & hotel settings from one place</p>
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
