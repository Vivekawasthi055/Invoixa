import { Helmet } from "react-helmet-async";
import "./Contact.css";

function Contact() {
  return (
    <>
      {/* ✅ SEO */}
      <Helmet>
        <title>Contact Invoixa – Get Support & Help</title>
        <meta
          name="description"
          content="Contact Invoixa for support, queries or feedback. We are here to help you with smart hotel billing solutions."
        />
      </Helmet>

      <main className="contact">
        {/* ================= HERO ================= */}
        <section className="contact-hero">
          <h1>Contact Us</h1>
          <p>
            Have a question or need help? Reach out to us and we’ll get back to
            you as soon as possible.
          </p>
        </section>

        {/* ================= CONTENT ================= */}
        <section className="contact-content">
          {/* Contact Form */}
          <div className="contact-card">
            <h2>Send us a message</h2>

            <form className="contact-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Your name" />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows="4"
                  placeholder="Write your message..."
                ></textarea>
              </div>

              <button type="submit" className="btn-primary">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-card info-card">
            <h2>Contact Information</h2>

            <p>
              <strong>Email:</strong> <br />
              <a href="mailto:invoixa@gmail.com">invoixa@gmail.com</a>
            </p>

            <p>
              <strong>Phone:</strong> <br />
              <a href="tel:+918827573086">+91 8827573086</a>
            </p>

            <p className="response-note">We usually respond within 24 hours.</p>
          </div>
        </section>
      </main>
    </>
  );
}

export default Contact;
