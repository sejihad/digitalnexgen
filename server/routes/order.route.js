import express from "express";
import {
  adminCancelOrder,
  AdmingetOrderById,
  adminOrders,
  deleteOrderByAdmin,
  getEligibleOrdersForServiceReview,
  getOrderById,
  getOrders,
  getOrdersCount,
  requestCancelOrder,
  updateOrderStatusByAdmin,
} from "../controllers/order.controller.js";

import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// USER ROUTES
router.get("/", verifyToken, getOrders);
router.get("/count", verifyToken, getOrdersCount);

// review eligibility
router.get(
  "/review-eligible/service/:serviceId",
  verifyToken,
  getEligibleOrdersForServiceReview,
);

// ADMIN
router.get("/admin", verifyToken, adminOrders);
router.get("/admin/:id", verifyToken, AdmingetOrderById);

// ORDER DETAILS
router.get("/:id", verifyToken, getOrderById);

// USER ACTION
router.put("/:orderId/request-cancel", verifyToken, requestCancelOrder);

// ADMIN ACTION
router.put("/:orderId/update-status", verifyToken, updateOrderStatusByAdmin);
router.put("/:orderId/admin-cancel", verifyToken, adminCancelOrder);
router.delete("/:orderId/delete", verifyToken, deleteOrderByAdmin);

export default router;
