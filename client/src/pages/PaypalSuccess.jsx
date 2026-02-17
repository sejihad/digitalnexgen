import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaypalSuccess = () => {
  const [params] = useSearchParams();
  const orderID = params.get("token"); // PayPal sends ?token=ORDER_ID
  const navigate = useNavigate();

  useEffect(() => {
    const capturePaypalPayment = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/paypal/capture`,
          { orderID },
          { withCredentials: true },
        );

        navigate("/orders"); // show success message
      } catch (err) {}
    };

    if (orderID) {
      capturePaypalPayment();
    }
  }, [orderID]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
      <h1 className="text-2xl font-semibold">
        ✅ Confirming your PayPal Payment...
      </h1>
    </div>
  );
};

export default PaypalSuccess;
