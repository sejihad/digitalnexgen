import express from "express";
import {
  enableTwoFactor,
  forgotPassword,
  googleCallback,
  googleLogin,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/verify-otp", verifyOtp);
router.get("/googlelogin", googleLogin);
router.get("/google/callback", googleCallback);

router.put("/update-password", verifyToken, updatePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/logout", logout);
router.put("/twofactor/toggle", verifyToken, enableTwoFactor);
export default router;
