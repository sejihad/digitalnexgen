import express from "express";
import {
  facebookCallback,
  facebookLogin,
  forgotPassword,
  firebaseVerify,
  googleCallback,
  googleLogin,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/googlelogin", googleLogin);
router.get("/google/callback", googleCallback);

router.get("/facebooklogin", facebookLogin);
router.get("/facebook/callback", facebookCallback);
router.put("/update-password", verifyToken, updatePassword);

// Firebase hybrid auth: client sends Firebase ID token, server verifies and issues cookie
router.post("/firebase", firebaseVerify);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/logout", logout);

export default router;
