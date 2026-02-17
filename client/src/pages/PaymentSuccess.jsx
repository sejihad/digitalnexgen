import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/stripe/session/${sessionId}`,
        );
        setSessionData(res.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-white px-4">
      <h1 className="text-3xl font-bold text-green-400 mb-4">
        ✅ Payment Successful!
      </h1>
      {sessionData && (
        <p className="text-lg mb-6">
          Thank you for purchasing{" "}
          <strong className="text-green-300">{sessionData.serviceName}</strong>.
        </p>
      )}

      <button
        onClick={() => navigate("/orders")}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Go to Orders
      </button>
    </div>
  );
};

export default PaymentSuccess;
