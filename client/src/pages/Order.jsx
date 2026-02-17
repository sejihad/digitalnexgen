import axios from "axios";
import { format } from "date-fns";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import stampCancelled from "../assets/cancelled-stamp.png";
import stampInProgress from "../assets/in-progress-stamp.png";
import logoUrl from "../assets/pdf-logo.png";
import stampCompleted from "../assets/stamp-complete.png";
import stampPending from "../assets/stamp-pending.png";

const Order = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/orders/${id}`, {
          withCredentials: true,
        });
        setOrder(res.data);
      } catch (err) {
        setError("Failed to load order details.");
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const getStamp = (status) => {
    switch (status) {
      case "completed":
        return stampCompleted;
      case "pending":
        return stampPending;
      case "cancelled":
        return stampCancelled;
      default:
        return stampInProgress;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#FF9800",
      "in progress": "#2196F3",
      completed: "#4CAF50",
      cancelled: "#F44336",
    };
    return colors[status.toLowerCase()] || "#9E9E9E";
  };

  const generatePDF = () => {
    if (!order) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = "#00DCEE";
    const secondaryColor = "#F5F5F5";
    const textColor = "#333333";
    const lightBorder = "#DDDDDD";

    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      doc.addImage(img, "PNG", pageWidth / 2 - 25, 15, 50, 25);

      doc.setFontSize(24);
      doc.setTextColor(primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", pageWidth / 2, 50, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor("#666666");
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice #: ${order._id}`, pageWidth - 20, 40, {
        align: "right",
      });
      doc.text(
        `Date: ${format(new Date(order.createdAt), "MMM dd, yyyy")}`,
        pageWidth - 20,
        45,
        { align: "right" },
      );

      doc.setDrawColor(lightBorder);
      doc.line(15, 55, pageWidth - 15, 55);

      const boxHeight = 40;

      // Customer box
      doc.setFillColor(secondaryColor);
      doc.rect(15, 60, 85, boxHeight, "F");
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "bold");
      doc.text("BILLED TO", 20, 68);
      doc.setFont("helvetica", "normal");
      doc.text(order.user.name, 20, 76);
      doc.text(order.user.email || "N/A", 20, 84);
      doc.text(order.user.phone || "N/A", 20, 92);

      // Service box
      doc.setFillColor(secondaryColor);
      doc.rect(110, 60, 85, boxHeight, "F");
      doc.setFont("helvetica", "bold");
      doc.text("SERVICE DETAILS", 115, 68);
      doc.setFont("helvetica", "normal");
      doc.text(order.service.name, 115, 76);
      doc.text(`Type: ${order.service.type}`, 115, 84);
      doc.text(`Price: $${order.finalPrice}`, 115, 92);

      // Payment info
      const paymentY = 123;
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT INFORMATION", 15, 115);
      doc.setFont("helvetica", "normal");
      doc.text("Payment Method:", 15, paymentY);
      doc.text(order.payment.method.toUpperCase(), 50, paymentY);
      doc.text("Transaction ID:", 15, paymentY + 8);
      doc.text(order.payment.transactionId, 50, paymentY + 8);
      doc.text("Status:", 15, paymentY + 16);
      doc.text(order.payment.status.toUpperCase(), 50, paymentY + 16);

      // Order status
      doc.setFont("helvetica", "bold");
      doc.text("ORDER STATUS:", 15, paymentY + 30);
      doc.setFillColor(getStatusColor(order.order_status));
      doc.rect(50, paymentY + 25, 40, 10, "F");
      doc.setTextColor("#FFFFFF");
      doc.text(order.order_status.toUpperCase(), 70, paymentY + 30, {
        align: "center",
      });

      // Stamp
      const stamp = new Image();
      stamp.src = getStamp(order.order_status);
      stamp.onload = () => {
        doc.addImage(stamp, "PNG", pageWidth - 70, 120, 25, 25);

        // Border
        doc.setDrawColor(lightBorder);
        doc.rect(10, 10, pageWidth - 20, 280);

        doc.save(`Invoice_${order._id}.pdf`);
      };
    };
  };

  if (error)
    return <p className="text-red-500 dark:text-red-400 p-6">{error}</p>;
  if (!order)
    return (
      <p className="text-gray-600 dark:text-gray-300 p-6">
        Loading order details...
      </p>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex justify-center items-start p-4 sm:p-8 text-gray-900 dark:text-gray-100 font-sans">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-3xl mx-auto relative border border-black/5 dark:border-white/10">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-sm sm:text-base font-bold text-primaryRgb">{`Order: #${order._id}`}</h1>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Customer + Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 text-gray-700 dark:text-gray-300">
          <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-black/5 dark:border-white/10">
            <h2 className="font-semibold text-base sm:text-lg text-primaryRgb mb-2 sm:mb-3">
              Customer Details
            </h2>
            <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
              <p className="break-all">Name: {order.user.name}</p>
              <p className="break-all">Email: {order.user.email || "N/A"}</p>
              <p className="break-all">Phone: {order.user.phone || "N/A"}</p>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-black/5 dark:border-white/10">
            <h2 className="font-semibold text-base sm:text-lg text-primaryRgb mb-2 sm:mb-3">
              Service Details
            </h2>
            <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
              <p>Name: {order.service.name}</p>
              <p>Type: {order.service.type}</p>
              <p>Price: ${order.finalPrice}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm sm:text-base">
          {/* Original Price */}
          <p>
            Original Price:{" "}
            <span className=" text-gray-500">${order.service.price}</span>
          </p>

          {/* Offer */}
          {order.service.offer?.price && (
            <div className="border-l-4 border-green-500 pl-3">
              <p className="text-green-600 dark:text-green-400 font-medium">
                Offer Price: ${order.service.offer.price}
              </p>
              <p className="text-xs text-gray-500 break-all">
                Offer Title: {order.service.offer.title}
              </p>
              <p className="text-xs text-gray-400 break-all">
                Offer ID: {order.service.offer.id}
              </p>
            </div>
          )}

          {/* Coupon */}
          {order.coupon?.code && (
            <p className="text-blue-600 dark:text-blue-400">
              Coupon ({order.coupon.code}): −$
              {order.coupon.discountAmount} ({order.coupon.discountPercent}%)
            </p>
          )}

          {/* Final Price */}
          <p className="font-bold text-lg text-primaryRgb">
            Final Price: ${order.finalPrice}
          </p>
        </div>
        {/* Payment */}
        <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg mb-4 sm:mb-6 text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/10">
          <h2 className="font-semibold text-base sm:text-lg text-primaryRgb mb-2 sm:mb-3">
            Payment Information
          </h2>
          <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
            <p>Method: {order.payment.method}</p>
            <p className="break-all">
              Transaction ID: {order.payment.transactionId}
            </p>
            <p>
              Status:{" "}
              <span
                className={`px-2 py-1 rounded text-xs sm:text-sm border ${
                  order.payment.status === "paid"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                    : order.payment.status === "pending"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800"
                }`}
              >
                {order.payment.status}
              </span>
            </p>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg mb-6 text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/10">
          <h2 className="font-semibold text-base sm:text-lg text-primaryRgb mb-2 sm:mb-3">
            Order Status
          </h2>
          <div className="flex items-center">
            <span
              className={`px-3 py-1.5 rounded-full text-sm sm:text-base font-medium border ${
                order.order_status === "completed"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                  : order.order_status === "pending"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                    : order.order_status === "in progress"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800"
              }`}
            >
              {order.order_status}
            </span>
          </div>
        </div>

        <button
          onClick={generatePDF}
          className="bg-[rgb(12,187,20)] hover:brightness-95 text-white px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
        >
          Download Invoice
        </button>
      </div>
    </div>
  );
};

export default Order;
