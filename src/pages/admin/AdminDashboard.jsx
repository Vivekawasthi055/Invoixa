import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard – Invoixa</title>
      </Helmet>

      <main>
        <h1>Admin Dashboard</h1>
        <button>
          <Link to="/admin/create-hotel">Create New Hotel</Link>
        </button>
<span> </span>
        <button>
          <Link to="/admin/hotels">Hotels List</Link>
        </button>
      </main>
    </>
  );
}

export default AdminDashboard;
