import express from "express";
import {
  adminCreateReview,
  adminDeleteReview,
  adminGetAllReviews,
  adminGetReviewsByService,
  adminGetSingleReviewById,
  adminUpdateReview,
  createReview,
  getReviewsByService,
} from "../controllers/review.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// user
router.post("/", verifyToken, createReview);

// admin
router.post("/admin", verifyToken, adminCreateReview);
router.get("/all", verifyToken, adminGetAllReviews);
router.get("/admin/service/:serviceId", verifyToken, adminGetReviewsByService);
router.get("/single/:id", verifyToken, adminGetSingleReviewById);
router.put("/:id", verifyToken, adminUpdateReview);
router.delete("/:id", verifyToken, adminDeleteReview);

// public service reviews
router.get("/:serviceId", getReviewsByService);

export default router;
