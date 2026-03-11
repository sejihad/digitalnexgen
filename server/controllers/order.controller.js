import Order from "../models/order.model.js";
import Service from "../models/service.model.js";

import { sendNotify } from "../services/notify.service.js";
import sendEmail from "../utils/sendEmail.js";
const sendOrderCompletedUserUpdates = async (order) => {
  const userId = String(order?.user?.id || "");
  const userEmail = order?.user?.email || "";
  const serviceName = order?.service?.name || "Your service";

  if (userId) {
    await sendNotify({
      title: "Order Completed",
      message: `${serviceName} has been  completed.`,
      users: [userId],
      type: "order",
      link: `/orders/${order._id}`,
    });
  }

  if (userEmail) {
    await sendEmail({
      email: userEmail,
      subject: "Your order has been completed",
      message: `${serviceName} has been  completed. You can now review your order from your account.`,
    });
  }
};

const sendOrderCancelledUserUpdates = async (order) => {
  const userId = String(order?.user?.id || "");
  const userEmail = order?.user?.email || "";
  const serviceName = order?.service?.name || "Your service";

  if (userId) {
    await sendNotify({
      title: "Order Cancelled",
      message: `${serviceName} has been cancelled.`,
      users: [userId],
      type: "order",
      link: `/orders/${order._id}`,
    });
  }

  if (userEmail) {
    await sendEmail({
      email: userEmail,
      subject: "Your order has been cancelled",
      message: `${serviceName} has been cancelled. Please log in to your account for order details.`,
    });
  }
};
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user.id": req.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrdersCount = async (req, res, next) => {
  try {
    // const ordersCount = await Order.countDocuments({
    //   ...(req.isAdmin ? { adminId: req.userId } : { buyerId: req.userId }),
    //   isCompleted: true,
    // });
    const ordersCount = await Order.countDocuments();
    res.status(200).json({ ordersCount });
  } catch (error) {
    next(error);
  }
};
export const adminCancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      order.order_status === "cancelled" ||
      order.order_status === "completed"
    ) {
      return res
        .status(400)
        .json({ message: "Order already completed or cancelled" });
    }

    order.order_status = "cancelled";
    order.cancel_request = false;
    await order.save();

    await sendOrderCancelledUserUpdates(order);

    res.json({ message: "Order cancelled by admin", order });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const requestCancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.id !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    if (
      order.order_status === "completed" ||
      order.order_status === "cancelled"
    )
      return res
        .status(400)
        .json({ message: "This order cannot be cancelled" });

    order.cancel_request = true;
    await order.save();

    res.json({ message: "Cancel request sent. Awaiting admin approval." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminOrders = async (req, res) => {
  try {
    if (!req.isAdmin)
      return res.status(403).json({ message: "Access denied, admin only." });
    const orders = await Order.find().sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const AdmingetOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!req.isAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatusByAdmin = async (req, res) => {
  try {
    const { newStatus } = req.body;
    const { orderId } = req.params;

    const validStatuses = ["pending", "in progress", "completed", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.order_status;

    order.order_status = newStatus;

    if (newStatus === "completed") {
      order.isReviewEligible = true;
    }

    await order.save();

    if (previousStatus !== newStatus) {
      /* ---------------- SALES INCREMENT ---------------- */

      if (newStatus === "completed") {
        const serviceId = order?.service?.id;

        if (serviceId) {
          await Service.findByIdAndUpdate(serviceId, {
            $inc: { sales: 1 },
          });
        }

        await sendOrderCompletedUserUpdates(order);
      }

      /* ---------------- CANCEL ---------------- */

      if (newStatus === "cancelled") {
        await sendOrderCancelledUserUpdates(order);
      }
    }

    res.status(200).json({
      message: "Status updated successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteOrderByAdmin = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getEligibleOrdersForServiceReview = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    if (!req.userId) {
      return next(createError(401, "You are not authenticated"));
    }

    if (!serviceId) {
      return next(createError(400, "Service id is required"));
    }

    const orders = await Order.find({
      "user.id": req.userId,
      "service.id": serviceId,
      order_status: "completed",
      isReviewEligible: true,
      isReviewed: false,
    })
      .select("_id service finalPrice createdAt order_status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("getEligibleOrdersForServiceReview error:", error);
    return next(
      createError(500, "Server error while fetching eligible orders"),
    );
  }
};
