import express from "express";
import {
  createOffer,
  getOffers,
  respondToOffer,
} from "../controllers/offer.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createOffer);
router.get("/", verifyToken, getOffers);
router.put("/:offerId", verifyToken, respondToOffer);

export default router;
