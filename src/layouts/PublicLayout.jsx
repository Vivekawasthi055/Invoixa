import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";

const HIDE_FOOTER_ROUTES = ["/login", "/forgot-password", "/reset-password"];

function PublicLayout() {
  const location = useLocation();

  const hideFooter = HIDE_FOOTER_ROUTES.includes(location.pathname);

  return (
    <>
      <Navbar />
      <Outlet />
      {!hideFooter && <Footer />}
    </>
  );
}

export default PublicLayout;
