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
  }, [id, apiBaseUrl]);
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
  const features = order?.service?.offer?.features?.length
    ? order.service.offer.features
    : order?.service?.features?.length
      ? order.service.features
      : [];

  const description =
    order?.service?.offer?.description || order?.service?.description || "";
  const generatePDF = () => {
    if (!order) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const colors = {
      primary: "#0CBB14",
      primarySoft: "#EAF9EC",
      dark: "#1F2937",
      text: "#374151",
      muted: "#6B7280",
      border: "#D1D5DB",
      lightBg: "#F9FAFB",
      white: "#FFFFFF",
    };

    const margin = 14;
    let y = 18;

    const getStatusColor = (status) => {
      const statusColors = {
        pending: "#F59E0B",
        "in progress": "#3B82F6",
        completed: "#22C55E",
        cancelled: "#EF4444",
      };
      return statusColors[status?.toLowerCase()] || "#9CA3AF";
    };

    const drawText = (
      text,
      x,
      yPos,
      size = 10,
      color = colors.text,
      style = "normal",
      align = "left",
    ) => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(color);
      doc.text(String(text || ""), x, yPos, { align });
    };

    const drawBox = (
      x,
      yPos,
      w,
      h,
      fill = colors.white,
      border = colors.border,
    ) => {
      doc.setFillColor(fill);
      doc.setDrawColor(border);
      doc.roundedRect(x, yPos, w, h, 3, 3, "FD");
    };

    const addWrappedText = (
      text,
      x,
      yPos,
      maxWidth,
      size = 10,
      color = colors.text,
      style = "normal",
      lineGap = 5,
    ) => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(color);
      const lines = doc.splitTextToSize(text || "", maxWidth);
      doc.text(lines, x, yPos);
      return yPos + lines.length * lineGap;
    };

    const logo = new Image();
    logo.src = logoUrl;

    logo.onload = () => {
      doc.setFillColor("#FFFFFF");
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // top accent bar
      doc.setFillColor(colors.primary);
      doc.rect(0, 0, pageWidth, 10, "F");

      // logo
      doc.addImage(logo, "PNG", margin, y, 44, 20);

      // heading
      drawText(
        "ORDER INVOICE",
        pageWidth - margin,
        y + 6,
        20,
        colors.dark,
        "bold",
        "right",
      );
      drawText(
        "Order Summary",
        pageWidth - margin,
        y + 12,
        9,
        colors.muted,
        "normal",
        "right",
      );

      y += 24;

      // invoice meta
      drawBox(margin, y, pageWidth - margin * 2, 22, "#F8FAFC", "#E5E7EB");
      drawText(
        `Invoice ID: ${order._id}`,
        margin + 4,
        y + 7,
        10,
        colors.dark,
        "bold",
      );
      drawText(
        `Issued: ${format(new Date(order.createdAt), "MMM dd, yyyy")}`,
        margin + 4,
        y + 14,
        9,
        colors.muted,
      );

      drawText("Order Status", pageWidth - 55, y + 7, 9, colors.muted);
      doc.setFillColor(getStatusColor(order.order_status));
      doc.roundedRect(pageWidth - 58, y + 10, 40, 8, 3, 3, "F");
      drawText(
        String(order.order_status || "").toUpperCase(),
        pageWidth - 38,
        y + 15.5,
        9,
        "#FFFFFF",
        "bold",
        "center",
      );

      y += 30;

      // info boxes
      const boxGap = 8;
      const boxWidth = (pageWidth - margin * 2 - boxGap) / 2;
      const boxHeight = 38;

      drawBox(margin, y, boxWidth, boxHeight, colors.lightBg, "#E5E7EB");
      drawText("BILLED TO", margin + 4, y + 7, 10, colors.primary, "bold");
      drawText(
        order.user?.name || "N/A",
        margin + 4,
        y + 15,
        11,
        colors.dark,
        "bold",
      );
      drawText(order.user?.email || "N/A", margin + 4, y + 22, 9, colors.text);
      drawText(order.user?.phone || "N/A", margin + 4, y + 29, 9, colors.text);

      const serviceX = margin + boxWidth + boxGap;
      drawBox(serviceX, y, boxWidth, boxHeight, colors.lightBg, "#E5E7EB");
      drawText(
        "SERVICE DETAILS",
        serviceX + 4,
        y + 7,
        10,
        colors.primary,
        "bold",
      );
      drawText(
        order.service?.name || "N/A",
        serviceX + 4,
        y + 15,
        11,
        colors.dark,
        "bold",
      );
      drawText(
        `Type: ${order.service?.type || "N/A"}`,
        serviceX + 4,
        y + 22,
        9,
        colors.text,
      );
      drawText(
        `Final Price: $${order.finalPrice}`,
        serviceX + 4,
        y + 29,
        9,
        colors.text,
      );

      y += boxHeight + 8;

      // service overview
      drawText("SERVICE OVERVIEW", margin, y, 11, colors.primary, "bold");
      y += 4;

      const overviewText =
        description || "No additional service description available.";
      const overviewLines = doc.splitTextToSize(
        overviewText,
        pageWidth - margin * 2 - 8,
      );
      const overviewHeight = Math.max(22, overviewLines.length * 5 + 10);

      drawBox(
        margin,
        y,
        pageWidth - margin * 2,
        overviewHeight,
        "#FCFCFD",
        "#E5E7EB",
      );
      addWrappedText(
        overviewText,
        margin + 4,
        y + 7,
        pageWidth - margin * 2 - 8,
        9,
        colors.text,
      );

      y += overviewHeight + 8;

      // features
      if (features.length > 0) {
        drawText("FEATURES INCLUDED", margin, y, 11, colors.primary, "bold");
        y += 4;

        const featureHeight = Math.max(20, features.length * 6 + 8);
        drawBox(
          margin,
          y,
          pageWidth - margin * 2,
          featureHeight,
          "#FCFCFD",
          "#E5E7EB",
        );

        let featureY = y + 7;
        features.forEach((feature) => {
          doc.setFillColor(colors.primary);
          doc.circle(margin + 5, featureY - 1, 1, "F");
          drawText(feature, margin + 9, featureY, 9, colors.text);
          featureY += 6;
        });

        y += featureHeight + 8;
      }

      // pricing & payment
      const lowerBoxHeight = 44;

      drawBox(margin, y, boxWidth, lowerBoxHeight, colors.lightBg, "#E5E7EB");
      drawText(
        "PRICING SUMMARY",
        margin + 4,
        y + 7,
        10,
        colors.primary,
        "bold",
      );
      drawText(
        `Original Price: $${order.service?.price ?? "N/A"}`,
        margin + 4,
        y + 15,
        9,
        colors.text,
      );

      let priceY = y + 22;
      if (order.service?.offer?.price) {
        drawText(
          `Offer Price: $${order.service.offer.price}`,
          margin + 4,
          priceY,
          9,
          "#15803D",
          "bold",
        );
        priceY += 6;
      }

      if (order.coupon?.code) {
        drawText(
          `Coupon (${order.coupon.code}): -$${order.coupon.discountAmount}`,
          margin + 4,
          priceY,
          9,
          "#2563EB",
        );
        priceY += 6;
      }

      drawText(
        `Final Price: $${order.finalPrice}`,
        margin + 4,
        y + 37,
        11,
        colors.dark,
        "bold",
      );

      drawBox(serviceX, y, boxWidth, lowerBoxHeight, colors.lightBg, "#E5E7EB");
      drawText(
        "PAYMENT DETAILS",
        serviceX + 4,
        y + 7,
        10,
        colors.primary,
        "bold",
      );
      drawText(
        `Method: ${order.payment?.method?.toUpperCase() || "N/A"}`,
        serviceX + 4,
        y + 15,
        9,
        colors.text,
      );
      drawText(
        `Transaction ID: ${order.payment?.transactionId || "N/A"}`,
        serviceX + 4,
        y + 22,
        9,
        colors.text,
      );
      drawText(
        `Payment Status: ${order.payment?.status?.toUpperCase() || "N/A"}`,
        serviceX + 4,
        y + 29,
        9,
        colors.text,
      );
      drawText(
        `Customer: ${order.user?.name || "N/A"}`,
        serviceX + 4,
        y + 36,
        9,
        colors.text,
      );

      const stamp = new Image();
      stamp.src = getStamp(order.order_status);

      stamp.onload = () => {
        doc.addImage(stamp, "PNG", pageWidth - 52, y + 3, 24, 24);

        y += lowerBoxHeight + 12;

        drawBox(margin, y, pageWidth - margin * 2, 24, "#F0FDF4", "#BBF7D0");
        drawText("NOTE", margin + 4, y + 7, 10, colors.primary, "bold");
        addWrappedText(
          "This invoice confirms the order details, payment state, and work status from the admin dashboard. Please retain this document for billing and support reference.",
          margin + 4,
          y + 14,
          pageWidth - margin * 2 - 8,
          8.5,
          colors.text,
        );

        drawText(
          "Thank you for managing your service orders with us.",
          pageWidth / 2,
          285,
          10,
          colors.muted,
          "italic",
          "center",
        );

        doc.setDrawColor("#E5E7EB");
        doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4);

        doc.save(`Invoice_${order._id}.pdf`);
      };

      stamp.onerror = () => {
        drawBox(
          margin,
          y + 46,
          pageWidth - margin * 2,
          24,
          "#F0FDF4",
          "#BBF7D0",
        );
        drawText("NOTE", margin + 4, y + 53, 10, colors.primary, "bold");
        addWrappedText(
          "This invoice confirms the order details, payment state, and work status from the admin dashboard. Please retain this document for billing and support reference.",
          margin + 4,
          y + 60,
          pageWidth - margin * 2 - 8,
          8.5,
          colors.text,
        );

        drawText(
          "Thank you for managing your service orders with us.",
          pageWidth / 2,
          285,
          10,
          colors.muted,
          "italic",
          "center",
        );

        doc.setDrawColor("#E5E7EB");
        doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4);

        doc.save(`Invoice_${order._id}.pdf`);
      };
    };

    logo.onerror = () => {
      const fallbackDoc = new jsPDF("p", "mm", "a4");
      fallbackDoc.text("Logo failed to load.", 20, 20);
      fallbackDoc.save(`Invoice_${order._id}.pdf`);
    };
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
              {order.service.offer?.description && (
                <p className="text-xs text-gray-300 mt-2 whitespace-pre-line">
                  {order.service.offer.description}
                </p>
              )}

              {Array.isArray(order.service.offer?.features) &&
                order.service.offer.features.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-gray-200 list-disc list-inside">
                    {order.service.offer.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
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
