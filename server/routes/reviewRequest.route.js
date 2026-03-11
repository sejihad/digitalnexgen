import express from "express";
import {
  createOrResendReviewRequest,
  getReviewRequests,
} from "../controllers/reviewRequest.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createOrResendReviewRequest);
router.get("/", verifyToken, getReviewRequests);

export default router;
