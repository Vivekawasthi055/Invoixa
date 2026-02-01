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
import NotFound from "../components/common/NotFound";

/* Admin Pages */
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreateHotel from "../pages/admin/CreateHotel";
import Hotels from "../pages/admin/Hotels";

/* Hotel Pages */
import Dashboard from "../pages/hotel/Dashboard";
import HotelProfileSettings from "../pages/hotel/HotelProfileSettings";
import Rooms from "../pages/hotel/Rooms";
import CreateInvoice from "../pages/hotel/CreateInvoice";
import AllInvoices from "../pages/hotel/AllInvoices";
import FinalInvoice from "../pages/hotel/FinalInvoice";
import CompleteProfile from "../pages/hotel/CompleteProfile";
import UserManual from "../pages/hotel/UserManual";

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
          {/* 👤 COMPLETE PROFILE */}
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute role="hotel">
                <CompleteProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotel/dashboard"
            element={
              <ProtectedRoute role="hotel">
                <Header /> {/* Dashboard Header */}
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hotel/rooms"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <Rooms />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hotel/invoices/new"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <CreateInvoice />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hotel/invoices/list"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <AllInvoices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hotel/invoices/:id"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <FinalInvoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotel/profilesettings"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <HotelProfileSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hotel/usermanual"
            element={
              <ProtectedRoute role="hotel">
                <Header />
                <UserManual />
              </ProtectedRoute>
            }
          />

          {/* 🛠 ADMIN ROUTES */}
          {/* ❌ Public Navbar/Footer yahan nahi honge */}
          {/* ✅ Admin bhi same Header use karega */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <Header />
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-hotel"
            element={
              <ProtectedRoute role="admin">
                <Header />
                <CreateHotel />
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

          {/* 🔁 Role-based redirect */}
          <Route path="/redirect" element={<RoleRedirect />} />

          {/* ❌ 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default AppRoutes;
