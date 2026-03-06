import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import DarkLogo from "../assets/DarkLogo.png";
import Logo from "../assets/logo.png";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      dispatch(showLoading());
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password/${token}`,
        { password },
      );
      toast.success(res.data.message || "Password reset successful!");
      dispatch(hideLoading());
      navigate("/auth/login");
    } catch (err) {
      dispatch(hideLoading());
      toast.error(err.response?.data.message || "An error occurred!");
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-black/10 bg-white/70 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="mb-5 border-b border-black/10 pb-3 dark:border-white/10">
            <div className="mb-4 flex justify-center">
              <img src={Logo} alt="Logo" className="h-10 w-auto dark:hidden" />
              <img
                src={DarkLogo}
                alt="Logo Of Digital NexGen"
                className="hidden h-10 w-auto dark:block"
              />
            </div>

            <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Reset Password
            </h1>
            <p className="mt-2 text-center text-sm leading-6 text-gray-600 dark:text-gray-400">
              Enter your new password to secure your account.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-green-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-green-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <button
              className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all duration-300 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
