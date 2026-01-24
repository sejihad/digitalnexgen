import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const AuthLayout = () => {
  return (
    <div>
      <Navbar />

      <div>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
