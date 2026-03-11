import { useNavigate } from "react-router-dom";

const PaypalCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-100 text-gray-900 dark:bg-[#0f0f0f] dark:text-white">
      <div className="w-full max-w-lg bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl p-6 sm:p-8 text-center">
        <div className="text-5xl sm:text-6xl mb-4">❌</div>

        <h1 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
          PayPal Payment Cancelled
        </h1>

        <p className="text-sm sm:text-lg text-gray-700 dark:text-gray-300 mb-6">
          You cancelled the PayPal payment. You can try again whenever you are
          ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Back to Home
          </button>

          <button
            onClick={() => navigate("/services")}
            className="w-full sm:w-auto bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaypalCancel;
