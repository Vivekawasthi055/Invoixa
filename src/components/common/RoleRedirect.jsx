import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getProfile } from "../../services/profileService";

function RoleRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  console.log("AUTH:", user, loading);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const redirectUser = async () => {
      const { data, error } = await getProfile(user.id);

      if (error || !data) {
        navigate("/login", { replace: true });
        return;
      }

      if (data.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (!data.profile_completed) {
        navigate("/complete-profile", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
      if (data.role !== "admin" && data.role !== "hotel") {
        navigate("/login", { replace: true });
        return;
      }

      setChecking(false);
    };

    redirectUser();
  }, [user, loading, navigate]);

  if (loading || checking) return <div>Setting things up...</div>;

  return null;
}

export default RoleRedirect;
