import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  return <h1>Hotel Dashboard</h1>;
}

export default Dashboard;
