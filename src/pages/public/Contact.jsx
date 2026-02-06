import { Helmet } from "react-helmet-async";
import "./styles/Contact.css";

function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact Invoixa – Support & Assistance</title>
        <meta
          name="description"
          content="Get in touch with Invoixa for support, queries or assistance related to hotel billing and invoicing."
        />
      </Helmet>

      <main className="contact-page">
        {/* ================= HERO ================= */}
        <section className="contact-page-hero">
          <h1>Get in Touch</h1>
          <p>
            Whether you have a question, need support or want to know more about
            Invoixa, we’re here to help you every step of the way.
          </p>
        </section>

        {/* ================= CONTENT ================= */}
        <section className="contact-page-content">
          {/* Contact Form */}
          <div className="contact-page-card">
            <h2>Send Us a Message</h2>

            <form className="contact-page-form">
              <div className="contact-page-form-group">
                <label>Your Name</label>
                <input type="text" placeholder="Enter your full name" />
              </div>

              <div className="contact-page-form-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" />
              </div>

              <div className="contact-page-form-group">
                <label>Your Message</label>
                <textarea
                  rows="4"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button type="submit" className="contact-page-btn">
                Submit Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-page-card contact-page-info">
            <h2>Contact Information</h2>

            <p>
              <strong>Email Support</strong> <br />
              <a href="mailto:invoixa@gmail.com">invoixa@gmail.com</a>
            </p>

            <p>
              <strong>Phone Support</strong> <br />
              <a href="tel:+918827573086">+91 88275 73086</a>
            </p>

            <p>
              Our support team is available to assist you with billing setup,
              invoice issues and general queries.
            </p>

            <p className="contact-page-note">
              ⏱ We usually respond within 24 hours on working days.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default Contact;
