import { Link, NavLink } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import { useAuth } from "../common/AuthContext";
import { useEffect, useState } from "react";
import { getProfile } from "../../services/profileService";
import "../../styles/Header.css";

function Header() {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data } = await getProfile(user.id);
      if (data?.role) setRole(data.role);
    };

    loadProfile();
  }, [user]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user || !role) return null;

  return (
    <header className="hdr-navbar">
      <div className="hdr-container">
        {/* Logo */}
        {role == "hotel" && (
          <Link to="/hotel/dashboard">
            <img src="/logo.png" alt="Invoixa Logo" className="hdr-logo" />
          </Link>
        )}

        {role == "admin" && (
          <Link to="/admin/dashboard">
            <img src="/logo.png" alt="Invoixa Logo" className="hdr-logo" />
          </Link>
        )}

        {/* ================= DESKTOP NAV ================= */}
        <nav className="hdr-links">
          {role === "hotel" && (
            <>
              <NavLink to="/hotel/dashboard">Dashboard</NavLink>
              <NavLink to="/hotel/invoices/new">Create Invoice</NavLink>
              <NavLink to="/hotel/invoices/list">All Invoices</NavLink>
              <NavLink to="/hotel/rooms">Rooms</NavLink>
              <NavLink to="/hotel/profilesettings">Profile & Settings</NavLink>
            </>
          )}

          {role === "admin" && (
            <>
              <NavLink to="/admin/dashboard">Dashboard</NavLink>
              <NavLink to="/admin/create-hotel">Create Hotel</NavLink>
              <NavLink to="/admin/hotels">Hotels</NavLink>
              <NavLink to="/admin/profilesettings">Profile & Settings</NavLink>
              <NavLink to="/admin/websiteinfo">Website Info</NavLink>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="hdr-actions">
          <button onClick={logoutUser} className="hdr-logout">
            Logout
          </button>

          {/* Hamburger */}
          <button
            className={`hdr-hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div className={`hdr-mobile-menu ${menuOpen ? "show" : ""}`}>
        {role === "hotel" && (
          <>
            <NavLink to="/hotel/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
            <NavLink
              to="/hotel/invoices/new"
              onClick={() => setMenuOpen(false)}
            >
              Create Invoice
            </NavLink>
            <NavLink
              to="/hotel/invoices/list"
              onClick={() => setMenuOpen(false)}
            >
              All Invoices
            </NavLink>
            <NavLink to="/hotel/rooms" onClick={() => setMenuOpen(false)}>
              Rooms
            </NavLink>
            <NavLink
              to="/hotel/profilesettings"
              onClick={() => setMenuOpen(false)}
            >
              Profile & Settings
            </NavLink>
          </>
        )}

        {role === "admin" && (
          <>
            <NavLink to="/admin/dashboard" onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/create-hotel"
              onClick={() => setMenuOpen(false)}
            >
              Create Hotel
            </NavLink>
            <NavLink to="/admin/hotels" onClick={() => setMenuOpen(false)}>
              Hotels
            </NavLink>
            <NavLink
              to="/admin/profilesettings"
              onClick={() => setMenuOpen(false)}
            >
              Profile & Settings
            </NavLink>
            <NavLink to="/admin/websiteinfo" onClick={() => setMenuOpen(false)}>
              Website Info
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
