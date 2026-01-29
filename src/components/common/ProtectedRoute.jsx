import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/profileService";
import { supabase } from "../../services/supabaseClient";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setAllowed(false);
      setChecking(false);
      return;
    }

    const checkAccess = async () => {
      // 1️⃣ Get profile
      const { data: profile } = await getProfile(user.id);

      if (!profile) {
        setAllowed(false);
        setChecking(false);
        return;
      }

      // 2️⃣ Role check
      if (role && profile.role !== role) {
        setAllowed(false);
        setChecking(false);
        return;
      }

      // 3️⃣ Hotel specific checks
      if (profile.role === "hotel") {
        // 🔒 Check hotel active
        const { data: hotel } = await supabase
          .from("hotels")
          .select("is_active")
          .eq("user_id", user.id)
          .single();

        if (!hotel || hotel.is_active !== true) {
          setAllowed(false);
          setChecking(false);
          return;
        }

        // 🔒 Profile completion check
        if (
          !profile.profile_completed &&
          window.location.pathname !== "/complete-profile"
        ) {
          window.location.href = "/complete-profile";
          return;
        }
      }
      // 🔒 Redirect if profile incomplete
      if (
        profile.role === "hotel" &&
        !profile.profile_completed &&
        window.location.pathname !== "/complete-profile"
      ) {
        window.location.href = "/complete-profile";
        return;
      }

      // 🔒 Block profile page after completion
      if (
        profile.profile_completed &&
        window.location.pathname === "/complete-profile"
      ) {
        window.location.href = "/hotel/dashboard";
        return;
      }
      // ✅ All checks passed
      setAllowed(true);
      setChecking(false);
    };

    checkAccess();
  }, [user, loading, role]);

  if (loading || checking)
    return (
      <main className="all-pages">
        <div className="all-pages-loading-card">
          <div className="all-pages-spinner"></div>
          <p className="loading-title">Checking access…</p>
        </div>
      </main>
    );

  if (!allowed) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
