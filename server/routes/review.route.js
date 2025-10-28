import express from "express";
import {
  createReview,
  deleteReview,
  getReviews,
  updateReview,
  adminListReviews,
  approveReview,
  rejectReview,
} from "../controllers/review.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createReview);
router.get("/:serviceId", getReviews);
router.delete("/:id",verifyToken, deleteReview);
router.put("/:id", verifyToken, updateReview);
// Admin list and moderation
router.get("/", verifyToken, adminListReviews);
router.patch("/:id/approve", verifyToken, approveReview);
router.patch("/:id/reject", verifyToken, rejectReview);

export default router;
