import React from "react";
import "../../styles/WebsiteInfo.css"; // We'll make a separate CSS file for styling

function WebsiteInfo() {
  return (
    <main className="wi-main">
      <h1 className="wi-title">Invoixa Website Overview</h1>

      {/* ===== Tech Stack Section ===== */}
      <section className="wi-section">
        <h2 className="wi-section-title">Tech Stack</h2>
        <ul className="wi-list">
          <li>
            <strong>Frontend:</strong> React + Vite
          </li>
          <li>
            <strong>Backend:</strong> Supabase (Auth, Database)
          </li>
          <li>
            <strong>Authentication:</strong> Supabase - Email/Password (Pass:
            Vivek@8 numbers) & Digital Plat - Google Login (Both with Invoixa
            Email)
          </li>
          <li>
            <strong>Hosting:</strong> Vercel
          </li>
          <li>
            <strong>Domain:</strong> Free domain -{" "}
            <a
              href="https://dash.domain.digitalplat.org/auth/login"
              target="_blank"
              rel="noopener noreferrer"
            >
              dash.domain.digitalplat.org
            </a>
          </li>
        </ul>
      </section>

      {/* ===== GitHub & Deployment Section ===== */}
      <section className="wi-section">
        <h2 className="wi-section-title">GitHub & Deployment</h2>
        <ul className="wi-list">
          <li>
            <strong>GitHub Repository:</strong> vivekawasthi055@gmail.com
            account
          </li>
          <li>
            <strong>Vercel Hosting:</strong> Live deployment on Vercel with same
            account
          </li>
        </ul>
      </section>

      {/* ===== Notes & Tips Section ===== */}
      <section className="wi-section">
        <h2 className="wi-section-title">Notes & Tips</h2>
        <ul className="wi-list">
          <li>
            This website is fully responsive and built with modern React best
            practices.
          </li>
          <li>
            Supabase handles backend including authentication and database
            seamlessly.
          </li>
          <li>
            All critical credentials should be kept safe; hints are provided
            here for reference only.
          </li>
          <li>
            UI/UX is designed to be clean, professional, and user-friendly
            across devices.
          </li>
        </ul>
      </section>
    </main>
  );
}

export default WebsiteInfo;
