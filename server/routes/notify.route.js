import express from "express";
import {
  adminSendNotification,
  deleteNotification,
  getNotificationById,
  getNotifies,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notify.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", verifyToken, getNotifies);
router.post("/send", verifyToken, adminSendNotification);
router.put("/read-all", verifyToken, markAllNotificationsAsRead);
router.get("/:id", verifyToken, getNotificationById);
router.put("/:id/read", verifyToken, markNotificationAsRead);
router.delete("/:id", verifyToken, deleteNotification);

export default router;
