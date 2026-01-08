import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "../../services/supabaseClient";
import "../../styles/login.css";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!PASSWORD_REGEX.test(password)) {
      alert(
        "Password must be at least 8 characters and contain at least 1 letter and 1 number"
      );
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (!error) {
      alert("Password updated successfully. Please login.");
      window.location.href = "/login";
    }

    setLoading(false);
  };

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
