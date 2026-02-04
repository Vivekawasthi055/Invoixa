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

  // ✅ NEW: inline messages
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
    setErrorMsg("");
    setSuccessMsg("");

    if (!PASSWORD_REGEX.test(password)) {
      setErrorMsg(
        "Password must be at least 8 characters with 1 letter & 1 number.",
      );
      return;
    }

    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg("Password updated successfully. Redirecting to login...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
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
      <div className="auth-expired-wrapper">
        <p className="auth-expired-text">
          ⚠️ This reset link has already been used or expired.
          <br />
          Please request a new password reset.
        </p>

        <button
          className="auth-expired-btn"
          onClick={() => (window.location.href = "/forgot-password")}
        >
          Request new reset link
        </button>
      </div>
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

            {/* ✅ INLINE MESSAGES */}
            {errorMsg && <p className="auth-error">{errorMsg}</p>}
            {successMsg && <p className="auth-success">{successMsg}</p>}

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
