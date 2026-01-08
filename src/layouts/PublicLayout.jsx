import { Outlet } from "react-router-dom";
import Navbar from "../components/public/Navbar";
import Footer from "../components/public/Footer";

const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default PublicLayout;
