import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <main className="nf-page">
      <div className="nf-card">
        <h1 className="nf-code">404</h1>
        <h2 className="nf-title">Page Not Found</h2>
        <p className="nf-text">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>

        <Link to="/" className="nf-btn">
          ⬅ Go Back Home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
