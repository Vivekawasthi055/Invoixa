import { Helmet } from "react-helmet-async";
import "./styles/About.css";

function About() {
  return (
    <>
      {/* ✅ SEO */}
      <Helmet>
        <title>About Invoixa – Smart & Simple Invoice Software</title>
        <meta
          name="description"
          content="Learn about Invoixa, a modern invoicing and billing platform designed to simplify hotel and business billing."
        />
      </Helmet>

      <main className="about-page">
        {/* ================= HERO ================= */}
        <section className="about-page-hero">
          <h1>About Invoixa</h1>
          <p>
            Invoixa is built to simplify invoicing and billing for hotels and
            modern businesses — without complexity.
          </p>
        </section>

        {/* ================= CONTENT ================= */}
        <section className="about-page-content">
          <div className="about-page-card">
            <h2>Why Invoixa?</h2>
            <p>
              Many hotels and businesses still rely on manual billing or
              complicated software. Invoixa was created to remove this
              complexity and provide a clean, fast and reliable invoicing
              experience.
            </p>
          </div>

          <div className="about-page-card">
            <h2>What We Offer</h2>
            <ul>
              <li>✔ Simple and fast invoice generation</li>
              <li>✔ Food, room and service billing support</li>
              <li>✔ Clean and professional invoice layout</li>
              <li>✔ Secure and reliable platform</li>
            </ul>
          </div>

          <div className="about-page-card">
            <h2>Our Vision</h2>
            <p>
              Our vision is to empower hotels and businesses with a billing
              system that is easy to use, scalable and future-ready — so you can
              focus on running your business, not managing invoices.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default About;
