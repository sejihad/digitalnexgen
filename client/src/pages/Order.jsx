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
  // review
  const [star, setStar] = useState(1);
  const [desc, setDesc] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  // api
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);
      setReviewMessage("");

      await axios.post(
        `${apiBaseUrl}/api/reviews`,
        {
          orderId: order._id,
          star,
          desc,
        },
        { withCredentials: true },
      );

      setReviewMessage("Review submitted successfully.");
      setOrder((prev) => ({
        ...prev,
        isReviewed: true,
        reviewedAt: new Date().toISOString(),
      }));
    } catch (err) {
      setReviewMessage(
        err.response?.data?.message || "Failed to submit review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };
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

  const getStatusColor = (status) => {
    const colors = {
      pending: "#FF9800",
      "in progress": "#2196F3",
      completed: "#4CAF50",
      cancelled: "#F44336",
    };
    return colors[status.toLowerCase()] || "#9E9E9E";
  };

  const uiDescription =
    order?.service?.offer?.description || order?.service?.description || "";

  const uiFeatures =
    Array.isArray(order?.service?.offer?.features) &&
    order.service.offer.features.length
      ? order.service.offer.features
      : Array.isArray(order?.service?.features) && order.service.features.length
        ? order.service.features
        : [];

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
      doc.text(text, x, yPos, { align });
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
      // Background
      doc.setFillColor("#FFFFFF");
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Top accent bar
      doc.setFillColor(colors.primary);
      doc.rect(0, 0, pageWidth, 10, "F");

      // Logo
      doc.addImage(logo, "PNG", margin, y, 44, 20);

      // Company / document heading
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
        "Service Billing Summary",
        pageWidth - margin,
        y + 12,
        9,
        colors.muted,
        "normal",
        "right",
      );

      y += 24;

      // Invoice meta row
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

      drawText(
        "Order Status",
        pageWidth - 55,
        y + 7,
        9,
        colors.muted,
        "normal",
      );
      doc.setFillColor(getStatusColor(order.order_status));
      doc.roundedRect(pageWidth - 58, y + 10, 40, 8, 3, 3, "F");
      drawText(
        order.order_status.toUpperCase(),
        pageWidth - 38,
        y + 15.5,
        9,
        "#FFFFFF",
        "bold",
        "center",
      );

      y += 30;

      // Two info boxes

      const boxGap = 8;
      const boxWidth = (pageWidth - margin * 2 - boxGap) / 2;

      const serviceName = order.service?.name || "N/A";
      const serviceNameLines = doc.splitTextToSize(serviceName, boxWidth - 8);
      const dynamicBoxHeight = Math.max(38, 24 + serviceNameLines.length * 5);

      // Billed To
      drawBox(margin, y, boxWidth, dynamicBoxHeight, colors.lightBg, "#E5E7EB");
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

      // Service Details
      const serviceX = margin + boxWidth + boxGap;
      drawBox(
        serviceX,
        y,
        boxWidth,
        dynamicBoxHeight,
        colors.lightBg,
        "#E5E7EB",
      );
      drawText(
        "SERVICE DETAILS",
        serviceX + 4,
        y + 7,
        10,
        colors.primary,
        "bold",
      );

      const serviceNameEndY = addWrappedText(
        serviceName,
        serviceX + 4,
        y + 15,
        boxWidth - 8,
        11,
        colors.dark,
        "bold",
        5,
      );

      drawText(
        `Type: ${order.service?.type || "N/A"}`,
        serviceX + 4,
        serviceNameEndY + 2,
        9,
        colors.text,
      );

      drawText(
        `Final Price: $${order.finalPrice}`,
        serviceX + 4,
        serviceNameEndY + 9,
        9,
        colors.text,
      );

      y += dynamicBoxHeight + 8;

      // Description / scope section
      drawText("SERVICE OVERVIEW", margin, y, 11, colors.primary, "bold");
      y += 4;

      let descHeight = 22;
      if (uiDescription) {
        const tempLines = doc.splitTextToSize(
          uiDescription,
          pageWidth - margin * 2 - 8,
        );
        descHeight = Math.max(22, tempLines.length * 5 + 10);
      }

      drawBox(
        margin,
        y,
        pageWidth - margin * 2,
        descHeight,
        "#FCFCFD",
        "#E5E7EB",
      );
      if (uiDescription) {
        addWrappedText(
          uiDescription,
          margin + 4,
          y + 7,
          pageWidth - margin * 2 - 8,
          9,
          colors.text,
        );
      } else {
        drawText(
          "No additional service description available.",
          margin + 4,
          y + 8,
          9,
          colors.muted,
        );
      }

      y += descHeight + 8;

      // Features
      if (uiFeatures.length > 0) {
        drawText("FEATURES INCLUDED", margin, y, 11, colors.primary, "bold");
        y += 4;

        const featureHeight = Math.max(20, uiFeatures.length * 6 + 8);
        drawBox(
          margin,
          y,
          pageWidth - margin * 2,
          featureHeight,
          "#FCFCFD",
          "#E5E7EB",
        );

        let featureY = y + 7;
        uiFeatures.forEach((feature) => {
          doc.setFillColor(colors.primary);
          doc.circle(margin + 5, featureY - 1, 1, "F");
          drawText(feature, margin + 9, featureY, 9, colors.text);
          featureY += 6;
        });

        y += featureHeight + 8;
      }

      // Pricing + Payment row
      const lowerBoxHeight = 42;

      // Pricing box
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
        y + 36,
        11,
        colors.dark,
        "bold",
      );

      // Payment box
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

      // Stamp
      const stamp = new Image();
      stamp.src = getStamp(order.order_status);

      stamp.onload = () => {
        doc.addImage(stamp, "PNG", pageWidth - 52, y + 2, 24, 24);

        y += lowerBoxHeight + 12;

        // Footer note
        drawBox(margin, y, pageWidth - margin * 2, 24, "#F0FDF4", "#BBF7D0");
        drawText("NOTE", margin + 4, y + 7, 10, colors.primary, "bold");
        addWrappedText(
          "This invoice confirms the requested IT service order, payment status, and current work status. Please keep this document for your records.",
          margin + 4,
          y + 14,
          pageWidth - margin * 2 - 8,
          8.5,
          colors.text,
        );

        // Footer line
        drawText(
          "Thank you for choosing our IT service.",
          pageWidth / 2,
          285,
          10,
          colors.muted,
          "italic",
          "center",
        );

        // Outer border
        doc.setDrawColor("#E5E7EB");
        doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4);

        doc.save(`Invoice_${order._id}.pdf`);
      };
    };
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 text-gray-900 dark:bg-black dark:text-gray-100">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200/60 bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-red-500/20 dark:bg-white/5">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white p-4 text-gray-900 dark:bg-black dark:text-gray-100">
        <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-gray-600 dark:text-gray-300">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-5 text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-5">
          {/* Header */}
          <div className="mb-4 flex flex-col gap-2 border-b border-black/10 pb-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="break-all text-sm font-bold text-[rgb(12,187,20)] sm:text-base">
                {`Order: #${order._id}`}
              </h1>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Complete order overview and invoice details
              </p>
            </div>

            <span className="w-fit rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Top info */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="mb-2 text-sm font-semibold text-[rgb(12,187,20)] sm:text-base">
                Customer Details
              </h2>
              <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                <p className="break-all">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Name:
                  </span>{" "}
                  {order.user.name}
                </p>
                <p className="break-all">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Email:
                  </span>{" "}
                  {order.user.email || "N/A"}
                </p>
                <p className="break-all">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Phone:
                  </span>{" "}
                  {order.user.phone || "N/A"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="mb-2 text-sm font-semibold text-[rgb(12,187,20)] sm:text-base">
                Service Details
              </h2>
              <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Name:
                  </span>{" "}
                  {order.service.name}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Type:
                  </span>{" "}
                  {order.service.type}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Price:
                  </span>{" "}
                  ${order.finalPrice}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-3 rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <h2 className="mb-2 text-sm font-semibold text-[rgb(12,187,20)] sm:text-base">
              Pricing Summary
            </h2>

            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-medium text-gray-900 dark:text-white">
                  Original Price:
                </span>{" "}
                <span className="text-gray-500 dark:text-gray-400">
                  ${order.service.price}
                </span>
              </p>

              {order.service.offer?.price && (
                <div className="rounded-xl border border-green-200 bg-green-50/80 p-3 dark:border-green-500/20 dark:bg-green-500/10">
                  <p className="font-medium text-green-700 dark:text-green-300">
                    Offer Price: ${order.service.offer.price}
                  </p>
                  <p className="mt-1 break-all text-xs text-gray-600 dark:text-gray-300">
                    Offer Title: {order.service.offer.title}
                  </p>
                  <p className="break-all text-xs text-gray-500 dark:text-gray-400">
                    Offer ID: {order.service.offer.id}
                  </p>

                  {order.service.offer?.description && (
                    <p className="mt-2 whitespace-pre-line text-xs text-gray-700 dark:text-gray-300">
                      {order.service.offer.description}
                    </p>
                  )}

                  {Array.isArray(order.service.offer?.features) &&
                    order.service.offer.features.length > 0 && (
                      <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-gray-700 dark:text-gray-200">
                        {order.service.offer.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}
                </div>
              )}

              {order.coupon?.code && (
                <p className="text-blue-600 dark:text-blue-400">
                  Coupon ({order.coupon.code}): −$
                  {order.coupon.discountAmount} ({order.coupon.discountPercent}
                  %)
                </p>
              )}

              <p className="pt-1 text-base font-bold text-[rgb(12,187,20)]">
                Final Price: ${order.finalPrice}
              </p>
            </div>
          </div>

          {/* Description / features fallback */}
          {(uiDescription || uiFeatures.length > 0) && (
            <div className="mt-3 rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="mb-2 text-sm font-semibold text-[rgb(12,187,20)] sm:text-base">
                Service Overview
              </h2>

              {uiDescription && (
                <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                  {uiDescription}
                </p>
              )}

              {uiFeatures.length > 0 && (
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {uiFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Payment + Order status */}
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="mb-2 text-sm font-semibold text-[rgb(12,187,20)] sm:text-base">
                Payment Information
              </h2>
              <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Method:
                  </span>{" "}
                  {order.payment.method}
                </p>
                <p className="break-all">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Transaction ID:
                  </span>{" "}
                  {order.payment.transactionId}
                </p>
                <p>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Status:
                  </span>{" "}
                  <span
                    className={`ml-1 inline-flex rounded-full border px-2.5 py-1 text-xs ${
                      order.payment.status === "paid"
                        ? "border-green-200 bg-green-100 text-green-700 dark:border-green-500/20 dark:bg-green-900/30 dark:text-green-300"
                        : order.payment.status === "pending"
                          ? "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "border-red-200 bg-red-100 text-red-700 dark:border-red-500/20 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {order.payment.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/60 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="mb-2 text-sm font-semibold text-[rgb(12,187,20)] sm:text-base">
                Order Status
              </h2>
              <div className="flex items-center">
                <span
                  className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${
                    order.order_status === "completed"
                      ? "border-green-200 bg-green-100 text-green-700 dark:border-green-500/20 dark:bg-green-900/30 dark:text-green-300"
                      : order.order_status === "pending"
                        ? "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : order.order_status === "in progress"
                          ? "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/20 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-red-200 bg-red-100 text-red-700 dark:border-red-500/20 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {order.order_status}
                </span>
              </div>
            </div>
          </div>
          {order.order_status === "completed" &&
            order.isReviewEligible &&
            !order.isReviewed && (
              <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[rgb(12,187,20)]">
                    Leave a Review
                  </h2>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Share your honest feedback
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Rating
                    </p>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setStar(value)}
                          className={`text-xl transition ${
                            star >= value
                              ? "text-yellow-400"
                              : "text-gray-300 hover:text-yellow-400 dark:text-gray-600"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={3}
                    placeholder="Write your feedback..."
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[rgb(12,187,20)] dark:border-white/10 dark:bg-black"
                  />

                  {/* Message */}
                  {reviewMessage && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {reviewMessage}
                    </p>
                  )}

                  {/* Submit */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="rounded-lg bg-[rgb(12,187,20)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-95 disabled:opacity-60"
                    >
                      {submittingReview ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              </div>
            )}

          {order.order_status === "completed" && order.isReviewed && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50/80 p-3 dark:border-green-500/20 dark:bg-green-500/10">
              <p className="text-xs font-medium text-green-700 dark:text-green-300">
                Review already submitted for this order.
              </p>
            </div>
          )}
          {/* Action */}
          <div className="mt-4">
            <button
              onClick={generatePDF}
              className="w-full rounded-xl bg-[rgb(12,187,20)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60 sm:w-auto"
            >
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
