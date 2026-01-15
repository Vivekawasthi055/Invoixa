import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="nav-navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <Link to="/">Invoixa</Link>
        </div>

        {/* Desktop Links */}
        <nav className="nav-links">
          <NavLink to="/" className="nav-link">
            Home
          </NavLink>
          <NavLink to="/about" className="nav-link">
            About
          </NavLink>
          <NavLink to="/contact" className="nav-link">
            Contact
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          <Link to="/login" className="nav-btn-login">
            Login
          </Link>
          {/* Mobile Menu Button */}
          <button
            className={`nav-hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`nav-mobile-menu ${menuOpen ? "show" : ""}`}>
        <NavLink to="/" onClick={() => setMenuOpen(false)}>
          Home
        </NavLink>
        <NavLink to="/about" onClick={() => setMenuOpen(false)}>
          About
        </NavLink>
        <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
          Contact
        </NavLink>
      </div>
    </header>
  );
};

export default Navbar;
