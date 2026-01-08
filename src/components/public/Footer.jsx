import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <h2 className="footer-logo">Invoixa</h2>
          <p className="footer-tagline">
            Simple & smart invoicing for modern businesses.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        {/* ✅ UPDATED Contact */}
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>
            Email: <a href="mailto:invoixa@gmail.com">invoixa@gmail.com</a>
          </p>
          <p>
            Phone: <a href="tel:+918827573086">+91 8827573086</a>
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Invoixa. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
