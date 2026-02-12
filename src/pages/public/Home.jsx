import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./styles/Home.css";

function Home() {
  return (
    <>
      <Helmet>
        <title>
          Hotel Billing Software for Hotels & Resorts | Invoixa Invoice System
        </title>

        <meta
          name="description"
          content="Invoixa is a smart hotel billing software for hotels, resorts and guest houses. Manage room charges, food billing, GST invoices and hotel services easily with secure cloud-based invoice management."
        />
        <link rel="canonical" href="https://invoixa.qzz.io/" />
      </Helmet>

      <main className="home-page">
        {/* ================= HERO ================= */}
        <section className="home-hero">
          <div className="home-hero-content">
            <div className="home-badge">Built for Modern Hotels</div>
            <h1>
              Hotel Billing Software for Hotels & Resorts <br />
              <span>Simple, Fast & GST-Ready</span>
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
        <section className="home-seo-content">
          <h2>Why Choose Invoixa Hotel Billing Software?</h2>
          <p>
            Managing hotel invoices manually can lead to errors and slow
            operations. Invoixa simplifies hotel billing by automating room
            calculations, applying GST taxes correctly and generating
            professional invoices instantly.
          </p>
          <p>
            Whether you run a small lodge or a multi-property resort, our hotel
            billing system helps you streamline operations, improve accuracy and
            save valuable time.
          </p>
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
        <section className="home-faq">
          <h2>Frequently Asked Questions</h2>

          <h3>What is hotel billing software?</h3>
          <p>
            Hotel billing software helps hotels manage room charges, food
            services, taxes and invoice generation automatically.
          </p>

          <h3>Does Invoixa support GST billing?</h3>
          <p>
            Yes, Invoixa generates GST-ready invoices suitable for hotels and
            resorts in India.
          </p>

          <h3>Can small hotels use Invoixa?</h3>
          <p>
            Absolutely. Invoixa is built for guest houses, lodges, boutique
            hotels and large resorts.
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
