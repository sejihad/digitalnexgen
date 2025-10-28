import express from "express";
import { createCheckoutSession } from "../controllers/stripe.controller.js";
import { verifyToken } from "../middleware/jwt.js";
const router = express.Router();

router.post("/checkout", verifyToken, createCheckoutSession);

export default router;
