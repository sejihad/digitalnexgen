import express from "express";
import passport from "passport";
import {
  enableTwoFactor,
  forgotPassword,
  googleLoginCallback,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/jwt.js";
import User from "../models/user.model.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // don't send password
    if (!user) return next(createError(404, "User not found"));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
});
router.post("/verify-otp", verifyOtp);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.put("/update-password", verifyToken, updatePassword);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/logout", logout);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_BASE_URL}/auth/login`,
    session: false,
  }),
  googleLoginCallback,
);

router.put("/twofactor/toggle", verifyToken, enableTwoFactor);
export default router;
