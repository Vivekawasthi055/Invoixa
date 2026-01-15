import { Link } from "react-router-dom";
import "./Footer.css";
const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="app-footer-container">
        {/* Brand */}
        <div className="app-footer-brand">
          <h2 className="app-footer-logo">Invoixa</h2>
          <p className="app-footer-tagline">
            Simple & smart invoicing for modern businesses.
          </p>
        </div>

        {/* Quick Links */}
        <div className="app-footer-links">
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

        {/* Contact */}
        <div className="app-footer-contact">
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
      <div className="app-footer-bottom">
        <p>© {new Date().getFullYear()} Invoixa. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
