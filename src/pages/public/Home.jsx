import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./styles/Home.css";

function Home() {
  return (
    <>
      <Helmet>
        <title>Invoixa – Smart Hotel Billing & Invoice Software</title>
        <meta
          name="description"
          content="Invoixa helps hotels manage room, food and service billing with fast, secure and professional invoicing."
        />
      </Helmet>

      <main className="home-page">
        {/* ================= HERO ================= */}
        <section className="home-hero">
          <div className="home-hero-content">
            <h1>
              Smart Hotel Invoicing <br />
              <span>Without the Hassle</span>
            </h1>

            <p>
              Invoixa is a modern billing and invoice management platform built
              for hotels, lodges and guest houses. Handle room charges, food
              bills and extra services — all from one clean dashboard.
            </p>

            <div className="home-hero-actions">
              <Link to="/login" className="home-btn-primary">
                Login to Dashboard
              </Link>
              <Link to="/about" className="home-btn-secondary">
                How It Works
              </Link>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-mockup-card">
              <p>Invoice Summary</p>
              <div className="home-mockup-line"></div>
              <div className="home-mockup-line small"></div>
              <div className="home-mockup-line"></div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="home-features">
          <h2>Everything You Need for Hotel Billing</h2>

          <div className="home-feature-grid">
            <div className="home-feature-card">
              <h3>🏨 Room Billing</h3>
              <p>
                Automatically calculate room charges based on stay duration,
                room type and rates.
              </p>
            </div>

            <div className="home-feature-card">
              <h3>🍽 Food & Services</h3>
              <p>
                Add breakfast, lunch, dinner and custom services directly into
                invoices.
              </p>
            </div>

            <div className="home-feature-card">
              <h3>📄 Professional Invoices</h3>
              <p>
                Generate clean, structured invoices that look professional and
                easy to understand.
              </p>
            </div>

            <div className="home-feature-card">
              <h3>⚡ Fast Workflow</h3>
              <p>
                Designed for speed — create and finalize invoices in just a few
                clicks.
              </p>
            </div>

            <div className="home-feature-card">
              <h3>🔒 Secure Data</h3>
              <p>
                Your billing data is stored securely using modern cloud
                infrastructure.
              </p>
            </div>

            <div className="home-feature-card">
              <h3>📊 Scalable System</h3>
              <p>
                Whether you manage one hotel or many, Invoixa grows with your
                business.
              </p>
            </div>
          </div>
        </section>

        {/* ================= TRUST ================= */}
        <section className="home-trust">
          <h2>Built for Real Hotel Operations</h2>
          <p>
            Invoixa is designed by understanding real hotel workflows — not just
            accounting theory. Simple screens, fewer clicks and clear data help
            staff work faster and owners stay in control.
          </p>
        </section>

        {/* ================= CTA ================= */}
        <section className="home-cta">
          <h2>Start Using Invoixa Today</h2>
          <p>
            No complex setup. No training required. Just login and start billing
            smarter.
          </p>

          <Link to="/login" className="home-btn-primary">
            Get Started Now
          </Link>
        </section>
      </main>
    </>
  );
}

export default Home;
