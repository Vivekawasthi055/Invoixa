import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "../../styles/AdminDashboard.css";

function AdminDashboard() {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard – Invoixa</title>
      </Helmet>

      <main className="adm-main">
        <h1 className="adm-title">Admin Dashboard</h1>

        <div className="adm-actions">
          <Link to="/admin/create-hotel" className="adm-btn adm-primary-btn">
            Create New Hotel
          </Link>

          <Link to="/admin/hotels" className="adm-btn adm-secondary-btn">
            Hotels List
          </Link>
        </div>
      </main>
    </>
  );
}

export default AdminDashboard;
