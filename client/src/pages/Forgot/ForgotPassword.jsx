import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { showLoading, hideLoading } from "../../redux/loadingSlice";

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
        { email }
      );
      setMessage(res.data?.message || "Password reset email sent!");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "An error occurred!");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r bg-white p-5">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md dark:bg-gray-800/80 rounded-2xl shadow-2xl p-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 text-center">
          Forgot Password
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-center">
          Enter your email address below and we will send you a link to reset your password.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-5 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 transition"
            />
            <i className="bx bx-envelope absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting..." : "Send Reset Link"}
          </button>
        </form>

        {message ? (
          <p className="mt-4 text-green-600 dark:text-green-400 text-center text-sm">{message}</p>
        ) : null}
        {error ? (
          <p className="mt-2 text-red-600 dark:text-red-400 text-center text-sm">{error}</p>
        ) : null}

        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          <Link to="/auth/login" className="text-green-600 dark:text-green-400 hover:underline font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
