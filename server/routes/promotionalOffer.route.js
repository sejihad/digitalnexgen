import express from "express";
import {
  createPromotionalOffer,
  getPromotionalOffers,
  getPromotionalOfferById,
  updatePromotionalOffer,
  deletePromotionalOffer,
  toggleOfferStatus,
} from "../controllers/promotionalOffer.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// Public route - get active offers
router.get("/", getPromotionalOffers);
router.get("/:id", getPromotionalOfferById);

// Admin routes - require authentication
router.post("/", verifyToken, createPromotionalOffer);
router.put("/:id", verifyToken, updatePromotionalOffer);
router.delete("/:id", verifyToken, deletePromotionalOffer);
router.patch("/:id/toggle", verifyToken, toggleOfferStatus);

export default router;
