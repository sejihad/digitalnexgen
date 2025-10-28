import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"

const AdminLayout = () => {
  return (
    <div>
        <Navbar/>
      <main>
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
};

export default AdminLayout;
