import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

/* ✅ NEW: Public layout (Navbar + Footer sirf yahin se control honge) */
import PublicLayout from "../layouts/PublicLayout";

/* Public Pages */
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

/* Protected / Common */
import ProtectedRoute from "../components/common/ProtectedRoute";
import Header from "../components/common/Header"; // Dashboard/Admin header

/* Admin Pages */
import AdminDashboard from "../pages/admin/AdminDashboard";
import Hotels from "../pages/admin/Hotels";

/* Hotel Pages */
import Dashboard from "../pages/hotel/Dashboard";
import Rooms from "../pages/hotel/Rooms";
import CreateInvoice from "../pages/hotel/CreateInvoice";
import AllInvoices from "../pages/hotel/AllInvoices";
import FinalInvoice from "../pages/hotel/FinalInvoice";
import CompleteProfile from "../pages/hotel/CompleteProfile";

import RoleRedirect from "../components/common/RoleRedirect";

function AppRoutes() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* ❌ IMPORTANT CHANGE:
            Header ko yahan se hata diya gaya
            kyunki ab Header public pages par nahi dikhana
        */}

        <Routes>
          {/* 🌍 PUBLIC ROUTES */}
          {/* ✅ Navbar + Footer sirf in routes par dikhenge */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* 🏨 HOTEL DASHBOARD ROUTES */}
          {/* ❌ Yahan Navbar/Footer nahi aayenge */}
          {/* ✅ Sirf Header (dashboard header) dikhega */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="hotel">
                <Header /> {/* Dashboard Header */}
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/rooms"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <Rooms />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/invoices/new"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <CreateInvoice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/invoices/list"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <AllInvoices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/invoices/:id"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <FinalInvoice />
              </ProtectedRoute>
            }
          />

          {/* 🛠 ADMIN ROUTES */}
          {/* ❌ Public Navbar/Footer yahan nahi honge */}
          {/* ✅ Admin bhi same Header use karega */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Header />
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/hotels"
            element={
              <ProtectedRoute role="admin">
                <Header />
                <Hotels />
              </ProtectedRoute>
            }
          />

          {/* 👤 COMPLETE PROFILE */}
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <CompleteProfile />
              </ProtectedRoute>
            }
          />

          {/* 🔁 Role-based redirect */}
          <Route path="/redirect" element={<RoleRedirect />} />

          {/* ❌ 404 */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default AppRoutes;
