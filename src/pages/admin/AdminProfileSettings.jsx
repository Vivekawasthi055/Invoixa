import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { logoutUser } from "../../services/authService";
import "../../styles/AdminProfileSettings.css";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function AdminProfileSettings() {
  const [loading, setLoading] = useState(true);

  /* ================= ADMIN PROFILE ================= */

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  /* ================= PASSWORD ================= */

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ================= LOAD ADMIN ================= */

  useEffect(() => {
    const loadAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("hotel_name, phone")
        .eq("id", user.id)
        .single();

      setForm({
        name: profile?.hotel_name || "Admin",
        phone: profile?.phone || "—",
        email: user.email, // auth se hi rahega
        role: profile?.role || "admin",
      });

      setLoading(false);
    };

    loadAdmin();
  }, []);

  /* ================= PASSWORD CHANGE ================= */

  const changePassword = async () => {
    setPasswordErr("");
    setPasswordMsg("");

    if (!PASSWORD_REGEX.test(newPassword)) {
      setPasswordErr("Password must be at least 8 chars with letter & number.");
      setTimeout(() => setPasswordErr(""), 2000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErr("Passwords do not match.");
      setTimeout(() => setPasswordErr(""), 2000);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: currentPassword,
    });

    if (error) {
      setPasswordErr("Current password is incorrect.");
      setTimeout(() => setPasswordErr(""), 2000);
      return;
    }

    await supabase.auth.updateUser({ password: newPassword });

    setPasswordMsg("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => setPasswordMsg(""), 2000);
  };

  /* ================= LOADING ================= */

  if (loading)
    return (
      <main className="all-pages">
        <div className="all-pages-loading-card">
          <div className="all-pages-spinner"></div>
          <p className="loading-title">Opening your Profile & Settings</p>
          <p className="loading-sub">Please wait a moment</p>
        </div>
      </main>
    );

  return (
    <main className="admin-settings-page">
      <h2 className="admin-settings-title">Admin Profile & Settings</h2>

      {/* ================= ADMIN INFO ================= */}
      <section className="admin-settings-card">
        <h3 className="admin-settings-card-title">Admin Information</h3>

        <div className="admin-settings-info-row">
          <span>Display Name: </span>
          <strong>{form.name}</strong>
        </div>
        <div className="admin-settings-info-row">
          <span>Role: </span>
          <strong>{form.role}</strong>
        </div>

        <div className="admin-settings-info-row">
          <span>Auth Email: </span>
          <strong>{form.email}</strong>
        </div>
        <div className="admin-settings-info-row">
          <span>Phone: </span>
          <strong>{form.phone}</strong>
        </div>
      </section>
      {/*=========================== BRAND ===========================*/}

      <section className="admin-settings-card">
        <h3>Website Brand Logo</h3>

        <img src="/logo.png" alt="Invoixa Logo" className="website-logo" />
      </section>
      {/* ================= SECURITY ================= */}
      <section className="admin-settings-card">
        <h3 className="admin-settings-card-title">Security</h3>

        <div className="admin-settings-password-field">
          <input
            className="admin-settings-input"
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <button
            type="button"
            className="admin-settings-toggle"
            onClick={() => setShowCurrentPassword((p) => !p)}
          >
            {showCurrentPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="admin-settings-password-field">
          <input
            className="admin-settings-input"
            type={showNewPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            className="admin-settings-toggle"
            onClick={() => setShowNewPassword((p) => !p)}
          >
            {showNewPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <div className="admin-settings-password-field">
          <input
            className="admin-settings-input"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="admin-settings-toggle"
            onClick={() => setShowConfirmPassword((p) => !p)}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button className="admin-settings-btn" onClick={changePassword}>
          Update Password
        </button>

        {passwordMsg && <p className="admin-settings-success">{passwordMsg}</p>}
        {passwordErr && <p className="admin-settings-error">{passwordErr}</p>}
      </section>

      {/* ================= LOGOUT ================= */}
      <div className="admin-settings-logout">
        <button className="admin-settings-btn secondary" onClick={logoutUser}>
          Logout
        </button>
      </div>
    </main>
  );
}

export default AdminProfileSettings;
