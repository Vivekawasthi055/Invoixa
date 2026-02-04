import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "../../services/supabaseClient";
import "../../styles/login.css";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);

  // 🔥 IMPORTANT: read session from URL
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setValidSession(true);
      }
      setLoading(false);
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!PASSWORD_REGEX.test(password)) {
      alert("Password must be at least 8 chars with letter & number");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated successfully. Please login.");
    window.location.href = "/login";
  };

  if (loading)
    return (
      <main className="all-pages">
        <div className="all-pages-loading-card">
          <div className="all-pages-spinner"></div>
          <p className="loading-title">Validating reset link...</p>
          <p className="loading-sub">Please wait a moment</p>
        </div>
      </main>
    );

  if (!validSession) {
    return (
      <p style={{ textAlign: "center", color: "red" }}>
        Invalid or expired reset link
      </p>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reset Password – Invoixa</title>
      </Helmet>

      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Create a strong new password for your account
          </p>

          <form onSubmit={handleReset} className="auth-form">
            <input
              type="password"
              placeholder="New password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm password"
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <p className="password-hint">
              Minimum 8 characters • 1 letter • 1 number
            </p>

            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default ResetPassword;
