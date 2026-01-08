import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <>
      {/* ✅ SEO */}
      <Helmet>
        <title>Invoixa – Simple Hotel Billing & Invoice Software</title>
        <meta
          name="description"
          content="Invoixa is a fast, simple and secure hotel billing & invoice software. Create professional invoices in minutes."
        />
      </Helmet>

      <main className="home">
        {/* ================= HERO SECTION ================= */}
        <section className="hero">
          <div className="hero-content">
            <h1>
              Smart Invoicing <br />
              <span>Made Simple</span>
            </h1>

            <p>
              Create professional hotel invoices with food, services and room
              billing — all in one simple platform.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="btn-primary">
                Login
              </Link>

              <Link to="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>

          {/* Illustration placeholder (NO heavy image) */}
          <div className="hero-visual">
            <div className="mockup-card">
              <p>Invoice Preview</p>
              <div className="mockup-line"></div>
              <div className="mockup-line small"></div>
              <div className="mockup-line"></div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="features">
          <h2>Why Choose Invoixa?</h2>

          <div className="feature-grid">
            <div className="feature-card">
              <h3>⚡ Fast Billing</h3>
              <p>Create invoices in seconds with minimal steps.</p>
            </div>

            <div className="feature-card">
              <h3>🧾 Food & Services</h3>
              <p>Breakfast, lunch, dinner and services billing built-in.</p>
            </div>

            <div className="feature-card">
              <h3>🔒 Secure & Reliable</h3>
              <p>Your data is protected with modern security practices.</p>
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="cta">
          <h2>Start creating invoices today</h2>
          <p>No complicated setup. No learning curve.</p>

          <Link to="/login" className="btn-primary">
            Get Started
          </Link>
        </section>
      </main>
    </>
  );
}

export default Home;
