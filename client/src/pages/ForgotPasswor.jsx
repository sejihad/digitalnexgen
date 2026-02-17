import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DarkLogo from "../assets/DarkLogo.png";
import element1 from "../assets/elements/element-1.png";
import element2 from "../assets/elements/element-2.png";
import Logo from "../assets/logo.png";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(showLoading());
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`,
        { email },
      );

      setMessage(res.data.message || "Password reset email sent!");
      setError("");
    } catch (err) {
      setError(err.response?.data.message || "An error occurred!");
      setMessage("");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="max-w-[1440px] flex items-center justify-center h-[max-content] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row w-full lg:w-[90%] px-8 py-8 rounded-xl justify-between items-center mx-auto bg-[#222222] gap-6 lg:gap-0">
        {/* Left Section */}
        <div className="w-full lg:w-[400px]">
          <div className="flex flex-col gap-6">
            <div className="text-primaryText flex flex-col gap-5">
              <div className="flex justify-center lg:justify-start">
                <img
                  src={Logo}
                  alt="Logo"
                  className="dark:hidden ml-[-15px] mb-2"
                />
                <img
                  src={DarkLogo}
                  alt="Logo Of Digital NexGen "
                  className=" hidden dark:block ml-[-15px] mb-2"
                />
              </div>
              <div>
                <h3 className="text-2xl font-openSans font-medium text-center lg:text-left text-white">
                  Forgot Password
                </h3>
                <p className="font-openSans text-base text-[#777777] text-center lg:text-left">
                  Enter your email address to receive a password reset link.
                </p>
              </div>
            </div>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="email"
                  className="text-primaryText font-openSans font-semibold"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-inherit border border-colorNeonPink focus:outline-none focus:shadow-focusNeonPink px-2 py-2 rounded-md text-primaryText"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                className={`text-black button-gradient w-full px-2 py-2 rounded-md font-openSans font-semibold ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>

            {message && <p className="text-green-500 text-sm">{message}</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-[url('/auth-bg.png')] auth-bg w-full h-[500px] lg:w-[600px] lg:h-[650px] rounded-xl relative bg-cover bg-top">
          <h1 className="text-3xl sm:text-5xl absolute top-10 left-4 sm:left-10 font-roboto italic text-primaryText">
            Reset <br /> Your Password
          </h1>
          <div className="absolute bottom-4 left-2 bg-white/20 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-3 sm:p-6">
            <img
              src={element1}
              className="w-[80px] lg:w-[150px]"
              alt="Decorative element 1"
              loading="lazy"
            />
          </div>
          <div className="absolute bottom-20 right-3 bg-white/20 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-3 sm:p-6">
            <img
              src={element2}
              className="w-[150px] lg:w-[300px]"
              alt="Decorative element 2"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
