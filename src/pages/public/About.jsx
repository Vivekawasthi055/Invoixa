import { Helmet } from "react-helmet-async";
import "./styles/About.css";

function About() {
  return (
    <>
      <Helmet>
        <title>About Invoixa – Smart Hotel Billing & Invoice Software</title>
        <meta
          name="description"
          content="Invoixa is a modern hotel billing and invoicing platform designed to simplify room, food and service billing."
        />
      </Helmet>

      <main className="about-page">
        {/* ================= HERO ================= */}
        <section className="about-page-hero">
          <h1>About Invoixa</h1>
          <p>
            Invoixa is a modern hotel billing and invoicing platform created to
            remove complexity from everyday billing operations and help
            businesses work faster and smarter.
          </p>
        </section>

        {/* ================= CONTENT ================= */}
        <section className="about-page-content">
          <div className="about-page-card">
            <h2>Why Invoixa Exists</h2>
            <p>
              Many hotels still depend on manual registers or outdated billing
              software that is slow and confusing. Invoixa was built to replace
              that with a clean, simple and efficient system anyone can use
              without training.
            </p>
          </div>

          <div className="about-page-card">
            <h2>What Invoixa Solves</h2>
            <ul>
              <li>✔ Room-wise and stay-based billing</li>
              <li>✔ Food and additional service charges</li>
              <li>✔ Clear and professional invoice structure</li>
              <li>✔ Faster checkout and fewer billing errors</li>
            </ul>
          </div>

          <div className="about-page-card">
            <h2>Who It’s For</h2>
            <p>
              Invoixa is designed for hotels, lodges, guest houses and hospitality
              businesses that want a reliable billing system without unnecessary
              features or complexity.
            </p>
          </div>

          <div className="about-page-card">
            <h2>Our Approach</h2>
            <p>
              We focus on real-world hotel workflows. Every screen and feature is
              designed to reduce clicks, save time and make billing stress-free
              for staff and managers.
            </p>
          </div>

          <div className="about-page-card">
            <h2>Security & Reliability</h2>
            <p>
              Invoixa is built on modern cloud infrastructure with secure data
              handling practices, ensuring your billing information remains safe
              and accessible when you need it.
            </p>
          </div>

          <div className="about-page-card">
            <h2>Our Vision</h2>
            <p>
              Our vision is to become a trusted billing partner for hospitality
              businesses by delivering a system that is simple today, scalable
              tomorrow and reliable for years to come.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default About;
