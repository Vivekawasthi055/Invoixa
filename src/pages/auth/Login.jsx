import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import "../../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await loginUser(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/redirect");
  };

  return (
    <>
      <Helmet>
        <title>Login – Invoixa</title>
      </Helmet>

      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Login to manage your invoices & billing
          </p>

          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default Login;
