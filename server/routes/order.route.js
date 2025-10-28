import express from "express";
import {
  adminCancelOrder,
  AdmingetOrderById,
  adminOrders,
  checkReviewEligibility,
  deleteOrderByAdmin,
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
router.get("/iseligible", verifyToken, checkReviewEligibility);
router.get("/admin", verifyToken, adminOrders);
router.get("/admin/:id", verifyToken, AdmingetOrderById);
router.get("/:id", verifyToken, getOrderById);
router.put("/:orderId/request-cancel", verifyToken, requestCancelOrder);

router.put("/:orderId/update-status", verifyToken, updateOrderStatusByAdmin);
router.put("/:orderId/admin-cancel", verifyToken, adminCancelOrder);
router.delete("/:orderId/delete", verifyToken, deleteOrderByAdmin);

export default router;
