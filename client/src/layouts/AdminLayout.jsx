import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

const AdminLayout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      <div className="flex">
        {isAuthenticated && user?.isAdmin && <AdminNavbar />}

        <main className="flex-1 px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
