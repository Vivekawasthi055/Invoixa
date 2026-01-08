import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/">Invoixa</Link>
        </div>

        {/* Links */}
        <nav className="navbar-links">
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
        <div className="navbar-actions">
          <Link to="/login" className="btn-login">
            Login
          </Link>
          <Link to="/contact" className="btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
