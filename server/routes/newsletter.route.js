import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createSubscription,
  getSubscriptions,
  deleteSubscription,
} from "../controllers/newsletter.controller.js";

const router = express.Router();

// Anyone can subscribe
router.post("/", createSubscription);

// Admin-only routes
router.get("/", verifyToken, getSubscriptions);
router.delete("/:id", verifyToken, deleteSubscription);

export default router;
