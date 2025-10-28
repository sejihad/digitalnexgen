import Order from "../models/order.model.js";

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user.id": req.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error);
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrdersCount = async (req, res, next) => {
  try {
    const ordersCount = await Order.countDocuments({
      ...(req.isAdmin ? { adminId: req.userId } : { buyerId: req.userId }),
      isCompleted: true,
    });

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
    )
      return res
        .status(400)
        .json({ message: "Order already completed or cancelled" });

    order.order_status = "cancelled";
    order.cancel_request = false;
    await order.save();

    res.json({ message: "Order cancelled by admin", order });
  } catch (error) {
    console.error("Admin Cancel Error:", error);
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
    console.error("Cancel Request Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminOrders = async (req, res) => {
  try {
    if (!req.isAdmin)
      return res.status(403).json({ message: "Access denied, admin only." });
    const orders = await Order.find();
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
    console.error("Error getting order:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateOrderStatusByAdmin = async (req, res) => {
  try {
    const { newStatus } = req.body;
    const { orderId } = req.params;

    // Validate status
    const validStatuses = ["pending", "in progress", "completed", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update status
    order.order_status = newStatus;
    await order.save();

    res.status(200).json({
      message: "Status updated successfully",
      order,
    });
  } catch (err) {
    console.error("Status update error:", err);
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
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkReviewEligibility = async (req, res) => {
  const userId = req.userId;
  const { serviceId } = req.query;

  if (!userId || !serviceId) {
    return res.status(400).json({ message: "Missing userId or serviceId" });
  }

  try {
    const allOrders = await Order.find({
      "user.id": userId,
    });

    const completeOrders = allOrders.filter(
      (order) => order.order_status === "completed"
    );
    
    const hasService = completeOrders.some(
      (order) => order.service.id === serviceId
    );

    res.status(200).json({
      eligible: hasService,
    });
  } catch (err) {
    console.error("Eligibility check error:", err);
    res.status(500).json({ message: "Server error", eligible: false });
  }
};
