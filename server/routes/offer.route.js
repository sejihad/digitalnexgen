import express from "express";
import {
  captureOfferPaypalOrder,
  createOffer,
  createOfferPaypalCheckout,
  createOfferStripeCheckout,
  getOffers,
  respondToOffer,
} from "../controllers/offer.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createOffer);
router.get("/", verifyToken, getOffers);
router.put("/:offerId", verifyToken, respondToOffer);

// ✅ NEW: offer payment routes
router.post(
  "/:offerId/checkout/stripe",
  verifyToken,
  createOfferStripeCheckout,
);
router.post(
  "/:offerId/checkout/paypal",
  verifyToken,
  createOfferPaypalCheckout,
);
router.post("/:offerId/capture/paypal", verifyToken, captureOfferPaypalOrder);

export default router;
