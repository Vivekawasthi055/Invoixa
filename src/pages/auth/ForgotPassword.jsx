import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  forgotPassword,
  checkEmailRegistered,
} from "../../services/authService";

import "../../styles/login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ⏳ resend cooldown
  const [cooldown, setCooldown] = useState(0);

  // ⏱️ timer logic
  useEffect(() => {
    if (cooldown === 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMsg("");

    // 🔍 Step 1: check email exists
    const { exists } = await checkEmailRegistered(email);

    if (!exists) {
      setErrorMsg("Email not registered. Please check your email address.");
      setLoading(false);
      return;
    }

    // 📩 Step 2: send reset link
    const { error } = await forgotPassword(email);

    if (error) {
      setErrorMsg("Failed to send reset link. Please try again.");
    } else {
      setMessage("Password reset link sent to your registered email.");
      setCooldown(60); // ⏳ start 60 sec lock
    }

    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password – Invoixa</title>
      </Helmet>

      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">
            Enter your registered email to receive reset link
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="primary-btn"
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : loading
                  ? "Sending..."
                  : "Send Reset Link"}
            </button>

            {message && <p className="success-text">{message}</p>}
            {errorMsg && <p className="error-text">{errorMsg}</p>}
          </form>
        </div>
      </main>
    </>
  );
}

export default ForgotPassword;
