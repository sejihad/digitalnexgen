import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import passport from "passport";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import { getFirebaseAdmin } from "../utils/firebaseAdmin.js";

export const register = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return next(createError(400, "Invalid email format"));
    }
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      return next(createError(400, "Only Gmail addresses are allowed"));
    }

    // Prevent duplicate email proactively for clearer message
    const existing = await User.findOne({ email });
    if (existing) {
      return next(createError(409, "Email already registered"));
    }

    const provided = req.body.username || req.body.name;
    if (!provided) return next(createError(400, "Name is required"));
    // Normalize to a safe username: lowercase, only [a-z0-9._-], 3-24 chars
    const base = String(provided)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9._-]/g, "");
    let normalized = base.slice(0, 24);
    if (normalized.length < 3) {
      normalized = (normalized + "user").slice(0, 24);
    }

    // Ensure uniqueness by appending numeric suffix if needed
    let candidate = normalized;
    let counter = 0;
    while (await User.exists({ username: candidate })) {
      counter += 1;
      const suffix = String(counter);
      const maxBaseLen = 24 - suffix.length;
      candidate = normalized.slice(0, maxBaseLen) + suffix;
      if (counter > 9999) break; // safety
    }
    const username = candidate;
    const hashedPassword = bcrypt.hashSync(req.body.password, 7);

    const newUser = new User({
      username: username,
      name: req.body.name || provided,
      email: email,
      country: req.body.country,
      phone: req.body.phone,
      number: req.body.number,
      img: req.body.img,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).send("User has been created!");
  } catch (err) {
    next(err);
  }
};

// Firebase Hybrid Auth: verify Firebase ID token, upsert user, issue our JWT cookie
export const firebaseVerify = async (req, res, next) => {
  try {
    const { idToken, name: nameInput, country, phone, img } = req.body || {};
    if (!idToken) return next(createError(400, "idToken is required"));

    const adminApp = getFirebaseAdmin();
    if (!adminApp)
      return next(createError(503, "Authentication service unavailable"));

    const decoded = await adminApp.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email || undefined;
    const name = decoded.name || decoded.displayName || "User";
    const picture = decoded.picture || undefined;

    // Find by email if available, else by a stored firebaseUid
    let user = email ? await User.findOne({ email }) : null;

    // Enforce Gmail-only policy for first-time registrations (allow existing users)
    if (!user) {
      const emailStr = String(email || "");
      const emailRegex2 = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
      if (!emailStr || !emailRegex2.test(emailStr)) {
        return next(createError(400, "Invalid email format"));
      }
      if (!emailStr.toLowerCase().endsWith("@gmail.com")) {
        return next(createError(400, "Only Gmail addresses are allowed"));
      }
    }

    if (!user) {
      // Create new user record
      const baseUsername = (name || "user")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "");
      let candidate = (baseUsername || "user").slice(0, 24) || "user";
      let counter = 0;
      while (await User.exists({ username: candidate })) {
        counter += 1;
        const suffix = String(counter);
        const maxBaseLen = 24 - suffix.length;
        candidate = (baseUsername || "user").slice(0, maxBaseLen) + suffix;
        if (counter > 9999) break;
      }

      user = new User({
        username: candidate,
        name: nameInput || name,
        email: email,
        img: img || picture,
        country: country,
        phone: phone,
        // No password required for social login
      });
      await user.save();
    }

    // Upsert optional fields from client if provided and missing in DB
    let updated = false;
    if (nameInput && !user.name) {
      user.name = nameInput;
      updated = true;
    }
    if (country && !user.country) {
      user.country = country;
      updated = true;
    }
    if (img && !user.img) {
      user.img = img;
      updated = true;
    }
    if (updated) await user.save();

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "30d" }
    );

    const { password, ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        // Consider environment for secure/sameSite flags
      })
      .status(200)
      .json({ token, ...info });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const identifier = req.body.email || req.body.username;
    if (!identifier || !req.body.password) {
      return next(createError(400, "Email/Username and password are required"));
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) return next(createError(404, "User not found"));

    const isCorrect = bcrypt.compareSync(req.body.password, user.password);
    if (!isCorrect)
      return next(createError(400, "Incorrect email/username or password"));

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "30d" }
    );

    const { password, ...info } = user._doc;
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .send(info);
  } catch (err) {
    next(err);
  }
};

export const googleLogin = passport.authenticate("google", {
  scope: [
    "profile",
    "email",
    "https://www.googleapis.com/auth/user.phonenumbers.read",
  ],
  session: false,
});

export const googleCallback = (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_BASE_URL}/auth/login`,
    session: false,
  })(req, res, async (err) => {
    if (err) return next(err);

    const token = jwt.sign(
      { id: req.user._id, isAdmin: req.user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "30d" }
    );

    const userData = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      img: req.user.img,
      isAdmin: req.user.isAdmin,
    };

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.redirect(
      `${process.env.CLIENT_BASE_URL}/google/callback?user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`
    );
  });
};

export const facebookLogin = passport.authenticate("facebook", {
  scope: ["email"],
  session: false,
});

export const facebookCallback = (req, res, next) => {
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.CLIENT_BASE_URL}/auth/login`,
    session: false,
  })(req, res, async (err) => {
    if (err) return next(err);

    const token = jwt.sign(
      { id: req.user._id, isAdmin: req.user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "30d" }
    );

    const userData = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      img: req.user.img,
      isAdmin: req.user.isAdmin,
    };

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.redirect(
      `${
        process.env.CLIENT_BASE_URL
      }/facebook/callback?user=${encodeURIComponent(JSON.stringify(userData))}`
    );
  });
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
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USERNAME}>`,
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
