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
const AdminOrder = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/orders/admin/${id}`, {
          withCredentials: true,
        });
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order.");
      }
    };
    fetchOrder();
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

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await axios.put(
        `${apiBaseUrl}/api/orders/${id}/update-status`,
        { newStatus },
        { withCredentials: true },
      );

      if (res.data && res.data.order) {
        setOrder(res.data.order);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const generatePDF = () => {
    if (!order) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Colors
    const primaryColor = "#00DCEE";
    const secondaryColor = "#F5F5F5";
    const textColor = "#333333";
    const lightBorder = "#DDDDDD";

    // Add Logo (top center)
    const img = new Image();
    img.src = logoUrl;
    img.onload = () => {
      doc.addImage(img, "PNG", pageWidth / 2 - 25, 15, 50, 25);

      // Invoice header
      doc.setFontSize(24);
      doc.setTextColor(primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", pageWidth / 2, 50, { align: "center" });

      // Invoice details
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

      // Divider line
      doc.setDrawColor(lightBorder);
      doc.line(15, 55, pageWidth - 15, 55);

      // Customer and Service side by side
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

      // Payment details section
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT INFORMATION", 15, 115);

      const paymentY = 123;
      doc.setFont("helvetica", "normal");
      doc.text("Payment Method:", 15, paymentY);
      doc.text(order.payment.method.toUpperCase(), 50, paymentY);

      doc.text("Transaction ID:", 15, paymentY + 8);
      doc.text(order.payment.transactionId, 50, paymentY + 8);

      doc.text("Status:", 15, paymentY + 16);
      doc.text(
        order.payment.status.toUpperCase(),
        50,
        paymentY + 16,
        null,
        null,
        null,
        {
          color: order.payment.status === "paid" ? "#4CAF50" : "#FF9800",
        },
      );

      // Order status with badge effect
      doc.setFont("helvetica", "bold");
      doc.text("ORDER STATUS:", 15, paymentY + 30);
      doc.setFillColor(getStatusColor(order.order_status));
      doc.rect(50, paymentY + 25, 40, 10, "F");
      doc.setTextColor("#FFFFFF");
      doc.text(order.order_status.toUpperCase(), 70, paymentY + 30, {
        align: "center",
      });

      // Terms and conditions
      doc.setTextColor("#666666");
      doc.setFontSize(8);

      // Add Stamp (right bottom)
      const stamp = new Image();
      stamp.src = getStamp(order.order_status);
      stamp.onload = () => {
        doc.addImage(stamp, "PNG", pageWidth - 70, 120, 25, 25);

        // Final border
        doc.setDrawColor(lightBorder);
        doc.rect(10, 10, pageWidth - 20, 280);

        doc.save(`Invoice_${order._id}.pdf`);
      };
    };

    // Helper function for status colors
    function getStatusColor(status) {
      const colors = {
        pending: "#FF9800",
        "in progress": "#2196F3",
        completed: "#4CAF50",
        cancelled: "#F44336",
      };
      return colors[status.toLowerCase()] || "#9E9E9E";
    }
  };

  if (error) return <p className="text-red-500 p-6">{error}</p>;
  if (!order)
    return <p className="text-gray-300 p-6">Loading order details...</p>;

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-start p-4 sm:p-8 text-white">
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-3xl">
        {/* Error Display */}
        {error && (
          <div className="bg-red-900 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
          <h1 className="text-lg sm:text-xl font-bold">
            Admin - Order #{order._id}
          </h1>
          <span className="text-sm text-gray-400">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Customer and Service - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 text-gray-300">
          {/* Customer Card */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h2 className="text-base sm:text-lg font-semibold text-[#00DCEE] mb-2">
              Customer Details
            </h2>
            <div className="space-y-1">
              <p className="break-all">{order.user.name}</p>
              <p className="break-all">{order.user.email}</p>
              <p className="break-all">{order.user.phone}</p>
            </div>
          </div>

          {/* Service Card */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h2 className="text-base sm:text-lg font-semibold text-[#00DCEE] mb-2">
              Service Details
            </h2>
            <div className="space-y-1">
              <p>{order.service.name}</p>
              <p>{order.service.type}</p>
              <p>${order.finalPrice}</p>
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

        {/* Payment Section */}
        <div className="bg-gray-700 p-4 rounded-lg mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-[#00DCEE] mb-2">
            Payment Information
          </h2>
          <div className="space-y-1">
            <p>Method: {order.payment.method}</p>
            <p className="break-all">
              Transaction ID: {order.payment.transactionId}
            </p>
            <p className="flex items-center gap-2">
              Status:
              <span
                className={`px-2 py-1 rounded text-xs ${
                  order.payment.status === "paid"
                    ? "bg-green-900 text-green-300"
                    : order.payment.status === "pending"
                      ? "bg-yellow-900 text-yellow-300"
                      : "bg-red-900 text-red-300"
                }`}
              >
                {order.payment.status}
              </span>
            </p>
          </div>
        </div>

        {/* Order Status Section */}
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-[#00DCEE] mb-2">
            Order Status
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.order_status === "completed"
                  ? "bg-green-900 text-green-300"
                  : order.order_status === "pending"
                    ? "bg-yellow-900 text-yellow-300"
                    : order.order_status === "in progress"
                      ? "bg-blue-900 text-blue-300"
                      : "bg-red-900 text-red-300"
              }`}
            >
              {order.order_status}
            </span>

            {/* Status Buttons - Responsive Layout */}
            <div className="flex flex-wrap gap-2">
              {["pending", "in progress", "completed", "cancelled"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={isUpdating}
                    className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                      order.order_status === status
                        ? "bg-[#00DCEE] text-gray-900"
                        : "bg-gray-600 hover:bg-gray-500 text-white"
                    } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isUpdating ? "Updating..." : `Mark as ${status}`}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={generatePDF}
            className="bg-[#00DCEE] hover:bg-[#00b9d6] text-gray-900 font-bold py-2 px-4 sm:px-6 rounded transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrder;
