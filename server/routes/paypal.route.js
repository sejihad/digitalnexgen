import express from "express";
import {
  capturePaypalOrder,
  createCheckoutSession,
} from "../controllers/paypal.controller.js";
import { verifyToken } from "../middleware/jwt.js";
const router = express.Router();

router.post("/checkout", verifyToken, createCheckoutSession);

router.post("/capture", verifyToken, capturePaypalOrder);

export default router;
