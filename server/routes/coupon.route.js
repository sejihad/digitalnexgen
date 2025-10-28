import express from "express";
import {
  addCoupon,
  allCoupon,
  deleteCoupon,
  updateCoupon,
  verifyCoupon,
} from "../controllers/coupon.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", verifyToken, allCoupon);
router.delete("/:id", verifyToken, deleteCoupon);
router.put("/:id", verifyToken, updateCoupon);
router.post("/add", verifyToken, addCoupon);
router.post("/verify", verifyToken, verifyCoupon);

export default router;
