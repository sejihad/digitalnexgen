import { useSelector } from "react-redux";
import AdminNavbar from "./AdminNavbar";
import GuestNavbar from "./GuestNavbar";
import UserNavbar from "./UserNavbar";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated && user?.isAdmin) {
    return <AdminNavbar />;
  }

  return (
    <div className="container mx-auto flex h-[80px]  justify-between items-center  dark:border-b  ">
      {isAuthenticated ? <UserNavbar /> : <GuestNavbar />}
    </div>
  );
};

export default Navbar;
