import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { forgotPassword } from "../../services/authService";
import "../../styles/login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMsg("");

    const { error } = await forgotPassword(email);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("Password reset link sent to your email.");
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

            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? "Sending..." : "Send Reset Link"}
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
