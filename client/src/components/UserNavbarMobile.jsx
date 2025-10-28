import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import placeholder from "../assets/user.png";
import { handleLogout } from "../utils/authUtils";

const UserNavbarMobile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData(user);
    }
  }, []);

  const logout = () => {
    handleLogout(dispatch, navigate);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="relative flex justify-between z-50 items-center w-full lg:hidden">
      <div>
        <button
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          className="lg:hidden"
        >
          <Menu color="white" size={32} />
        </button>
        <nav
          className={`absolute top-20 left-0 bg-[#333333] w-[300px] pt-2 rounded-md shadow-lg transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-[200%]"
          }`}
        >
          <ul className="flex flex-col">
            <li className="border-b border-[#444444] pb-2">
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex justify-center items-center gap-4"
              >
                <img
                  src={userData?.img || placeholder}
                  alt="profile image of user"
                  className="w-12 h-12"
                />
                <p className="font-openSans text-primaryText dark:text-[#ededed] ">
                  {userData?.username || "Guest"}
                </p>
              </Link>
            </li>
            <li>
              <Link
                to="/billing"
                onClick={closeMenu}
                className="flex items-center justify-center font-openSans dark:text-[#ededed]  text-primaryText hover:text-primaryRgb transition-colors duration-300 border-b border-[#444444] py-3 font-medium"
              >
                Billing & Payments
              </Link>
            </li>
            <li>
              <Link
                to="/messages"
                onClick={closeMenu}
                className="flex items-center justify-center font-openSans dark:text-[#ededed]  text-primaryText hover:text-primaryRgb transition-colors duration-300 border-b border-[#444444] py-3 font-medium"
              >
                Messages
              </Link>
            </li>
            <li>
              <Link
                to="/special-offers"
                onClick={closeMenu}
                className="flex items-center justify-center font-openSans dark:text-[#ededed]  text-primaryText hover:text-primaryRgb transition-colors duration-300 border-b border-[#444444] py-3 font-medium"
              >
                Special Offers
              </Link>
            </li>
            <li>
              <Link
                to="/favorites"
                onClick={closeMenu}
                className="flex items-center justify-center font-openSans dark:text-[#ededed]  text-primaryText hover:text-primaryRgb transition-colors duration-300 border-b border-[#444444] py-3 font-medium"
              >
                Favorites
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                onClick={closeMenu}
                className="flex items-center justify-center font-openSans dark:text-[#ededed]  text-primaryText hover:text-primaryRgb transition-colors duration-300 border-b border-[#444444] py-3 font-medium"
              >
                Settings
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                onClick={closeMenu}
                className="flex items-center justify-center font-openSans dark:text-[#ededed]  text-primaryText hover:text-primaryRgb transition-colors duration-300 border-b border-[#444444] py-3 font-medium"
              >
                Orders
              </Link>
            </li>
            <li className="flex items-center justify-center">
              <button
                onClick={logout}
                className="font-openSans dark:text-[#ededed]  text-primaryText hover:text-primaryRgb transition-colors duration-300 py-3 font-medium"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div>
        <Link to="/">
          <img src={Logo} alt="Logo Of Eagle Boost" className="w-[100%]" />
        </Link>
      </div>
      <div className="lg:hidden"></div>
    </div>
  );
};

export default UserNavbarMobile;
