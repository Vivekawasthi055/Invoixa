import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../components/common/AuthContext";
import { getProfile } from "../../services/profileService";

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
    <main style={{ padding: 20 }}>
      <h1>Hotel Dashboard</h1>

      <button>
        <Link to="/dashboard/invoices/new">➕ Create New Invoice</Link>
      </button>

      <button style={{ marginLeft: 10 }}>
        <Link to="/dashboard/invoices/list">📄 All Invoices</Link>
      </button>

      <button style={{ marginLeft: 10 }}>
        <Link to="/dashboard/rooms">Rooms</Link>
      </button>

      <button style={{ marginLeft: 10 }}>
        <Link to="/dashboard/profilesettings">Profile & Settings</Link>
      </button>
    </main>
  );
}

export default Dashboard;
