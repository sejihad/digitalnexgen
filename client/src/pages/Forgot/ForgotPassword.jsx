import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { hideLoading, showLoading } from "../../redux/loadingSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loading.isLoading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    dispatch(showLoading());

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`,
        { email },
      );
      setMessage(res.data?.message || "Password reset email sent!");
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "An error occurred!",
      );
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-black/10 bg-white/70 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="mb-5 border-b border-black/10 pb-3 dark:border-white/10">
            <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Forgot Password
            </h1>
            <p className="mt-2 text-center text-sm leading-6 text-gray-600 dark:text-gray-400">
              Enter your email address and we will send you a password reset
              link.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300"
              >
                Email Address
              </label>

              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-green-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-400"
                />
                <i className="bx bx-envelope absolute right-3 top-1/2 -translate-y-1/2 text-base text-gray-400"></i>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition-all duration-300 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Submitting..." : "Send Reset Link"}
            </button>
          </form>

          {message ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-center text-sm text-green-700 dark:border-green-500/20 dark:bg-green-900/20 dark:text-green-300">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700 dark:border-red-500/20 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <div className="mt-5 text-center">
            <Link
              to="/auth/login"
              className="text-sm font-medium text-green-600 transition hover:underline dark:text-green-400"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
