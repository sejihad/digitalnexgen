import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import sendEmail from "../utils/sendEmail.js";

// Cloudflare Turnstile verification
const verifyTurnstile = async (token, ip) => {
  if (!token) return false;

  const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const params = new URLSearchParams();
  params.append("secret", process.env.TURNSTILE_SECRET_KEY);
  params.append("response", token);
  if (ip) params.append("remoteip", ip);

  const res = await fetch(verifyUrl, {
    method: "POST",
    body: params,
  });

  const data = await res.json();
  return data.success;
};

export const register = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const provided = req.body.username || req.body.name;
    if (!provided) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const name = req.body.name || provided;

    // username normalize
    const base = provided
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "");

    let username = base.slice(0, 24);
    let counter = 0;

    while (await User.exists({ username })) {
      counter++;
      username = `${base.slice(0, 20)}${counter}`;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username,
      name,
      email,
      country: req.body.country,
      phone: req.body.phone,
      number: req.body.number,
      img: req.body.img,
      password: hashedPassword,
      isTwoFactorEnabled: true,
    });

    // OTP generate
    const otp = crypto.randomInt(100000, 999999).toString();
    newUser.twoFactorCode = otp;
    newUser.twoFactorExpire = Date.now() + 5 * 60 * 1000;

    await newUser.save();

    const message = `
Hi ${name},

Welcome to Digital Nexgen 🎉

Your account has been created successfully.
Your verification OTP is: ${otp}
It will expire in 5 minutes.

We're excited to have you on board. Explore our platform and enjoy the features we offer.
If you have any questions, feel free to reply to this email.

Regards,
Digital Nexgen Team
`;

    sendEmail({
      email: newUser.email,
      subject: "Verify your Digital Nexgen account",
      message,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email for verification",
      twoFactorRequired: true,
      userId: newUser._id,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { cfToken, email, password } = req.body;

    // Turnstile verification - FIXED
    const tokenValid = await verifyTurnstile(cfToken, req.ip);
    if (!tokenValid) {
      return res.status(400).json({
        success: false,
        message: "Human verification failed",
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // 2FA / OTP check
    if (user.isTwoFactorEnabled) {
      // Generate new OTP if expired or doesn't exist
      if (!user.twoFactorCode || user.twoFactorExpire < Date.now()) {
        const otp = crypto.randomInt(100000, 999999).toString();
        user.twoFactorCode = otp;
        user.twoFactorExpire = Date.now() + 5 * 60 * 1000;
        await user.save();

        sendEmail({
          email: user.email,
          subject: "Digital Nexgen Login OTP",
          message: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        });
      }

      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        userId: user._id.toString(),
        message: "OTP sent to your email",
      });
    }

    // Normal login (without OTP)
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "30d" },
    );

    const {
      password: pwd,
      twoFactorCode,
      twoFactorExpire,
      ...info
    } = user._doc;

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json(info);
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const verifyOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // OTP check
    if (
      !user.twoFactorCode ||
      !user.twoFactorExpire ||
      user.twoFactorCode !== otp ||
      user.twoFactorExpire < Date.now()
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Clear OTP
    user.twoFactorCode = null;
    user.twoFactorExpire = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "30d" },
    );

    const { password, twoFactorCode, twoFactorExpire, ...info } = user._doc;

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json(info);
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const googleLoginCallback = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return next(
        new ErrorHandler(
          "Google authentication failed. Please try again.",
          401,
        ),
      );
    }
    if (user.isNewUser) {
      const message = `
      Hi ${user.name},

      🎉 Welcome to Digital Nexgen!

      Your Google account has been created successfully.
      You can now log in anytime using Google Login.

      We're excited to have you on board!

      Regards,
      Digital Nexgen Team
    `;

      try {
        sendEmail({
          email: user.email,
          subject: "Account Created🎉",
          message,
        });
      } catch (err) {}
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "30d" },
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${process.env.CLIENT_BASE_URL}/google-success`);
  } catch (err) {
    next(err);
  }
};
export const enableTwoFactor = async (req, res, next) => {
  console.log("Toggling Two Factor Authentication for user:", req.userId);
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Two Factor ${
        user.isTwoFactorEnabled ? "enabled" : "disabled"
      } successfully`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been successfully logged out");
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(createError(404, "User not found!"));

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 10 * 60 * 1000;

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpiry = tokenExpiry;

    await user.save();

    const resetURL = `${process.env.CLIENT_BASE_URL}/auth/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Digital NexGen" <${process.env.SMTP_MAIL}>`,
      to: user.email,
      subject: "Password Reset Request",
      text: `You have requested a password reset. Click on the link below to reset your password: \n\n ${resetURL} \n\n If you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send("Password reset link sent to your email.");
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) return next(createError(400, "Invalid or expired token"));

    user.password = bcrypt.hashSync(req.body.password, 7);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.status(200).send("Password has been successfully reset.");
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old and new passwords required" });
  }

  try {
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
