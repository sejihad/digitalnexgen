import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/stripe/session/${sessionId}`,
        );
        setSessionData(res.data);
      } catch (err) {
        setError("Unable to load payment details.");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionDetails();
    } else {
      setError("Session ID not found.");
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900 dark:bg-[#0f0f0f] dark:text-white px-4">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#181818] shadow-lg p-6 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-semibold animate-pulse">
            Loading...
          </h2>
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
            Payment Successful!
          </h1>
        </div>

        {error ? (
          <p className="text-sm sm:text-base text-red-500 dark:text-red-400 mb-6">
            {error}
          </p>
        ) : (
          sessionData && (
            <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Thank you for purchasing{" "}
              <strong className="text-green-600 dark:text-green-300">
                {sessionData.serviceName}
              </strong>
              .
            </p>
          )
        )}

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

export default PaymentSuccess;
