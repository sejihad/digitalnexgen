import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaypalSuccess = () => {
  const [params] = useSearchParams();
  const orderID = params.get("token");

  const navigate = useNavigate();
  const hasCapturedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("Confirming your PayPal payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    const capturePaypalPayment = async () => {
      if (!orderID) {
        setError("PayPal order token was not found.");
        setLoading(false);
        return;
      }

      if (hasCapturedRef.current) return;
      hasCapturedRef.current = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/paypal/capture`,
          { orderID },
          { withCredentials: true },
        );

        setSuccess(true);
        setMessage(
          res?.data?.message || "Your PayPal payment has been confirmed.",
        );
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "We could not confirm your PayPal payment. Please contact support if money was charged.",
        );
      } finally {
        setLoading(false);
      }
    };

    capturePaypalPayment();
  }, [orderID]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-100 text-gray-900 dark:bg-[#0f0f0f] dark:text-white">
        <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#181818] shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 text-center">
          <div className="text-5xl sm:text-6xl mb-4">⏳</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            Confirming Payment
          </h1>
          <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-100 text-gray-900 dark:bg-[#0f0f0f] dark:text-white">
        <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#181818] shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 text-center">
          <div className="text-5xl sm:text-6xl mb-4">❌</div>

          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
            Payment Confirmation Failed
          </h1>

          <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-6">
            {error}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/orders")}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
            >
              Go to Orders
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-100 text-gray-900 dark:bg-[#0f0f0f] dark:text-white">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#181818] shadow-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 text-center">
        <div className="mb-4">
          <div className="text-5xl sm:text-6xl mb-3">✅</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
            PayPal Payment Successful!
          </h1>
        </div>

        <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/orders")}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
          >
            Go to Orders
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaypalSuccess;
