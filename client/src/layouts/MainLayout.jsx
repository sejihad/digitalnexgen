import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <div>
      <Navbar/>
      <main className="lg:pt-[10px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
