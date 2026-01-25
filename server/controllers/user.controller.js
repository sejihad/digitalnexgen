import deleteFromS3 from "../config/deleteFromS3.js";
import uploadToS3 from "../config/uploadToS3.js";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");

    if (req.userId !== user._id.toString()) {
      return next(createError(403, "You can delete only your account!"));
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).send("User deleted successfully");
  } catch (error) {
    res.status(500).send("Something went wrong!");
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).send("User not found");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Something went wrong!");
  }
};
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Only allow user to update own profile
    if (req.userId !== user._id.toString()) {
      return next(createError(403, "You can update only your account!"));
    }

    // Update basic fields
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.country = req.body.country || user.country;

    // Unified phone/number logic (same as registration)
    const phoneInput = String(req.body.phone || "").replace(/[^0-9]/g, ""); // remove non-digits
    if (phoneInput) {
      let combinedPhone = phoneInput;
      // Optional: add country code if passed separately
      if (req.body.countryCode) {
        const code = String(req.body.countryCode).replace(/\D/g, ""); // only digits
        combinedPhone = `+${code}${phoneInput.startsWith("0") ? phoneInput.slice(1) : phoneInput}`;
      }
      user.phone = combinedPhone; // E164 format
      user.number = phoneInput; // raw number without country code
    }

    // Handle profile image
    if (req.files && req.files.img) {
      if (user.img?.public_id) {
        await deleteFromS3(user.img.public_id);
      }

      const uploaded = await uploadToS3(req.files.img, "users");
      user.img = {
        public_id: uploaded.key,
        url: uploaded.url,
      };
    }

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Something went wrong!" });
  }
};

// Public: fetch a user's public profile by username
export const getUserByUsername = async (req, res) => {
  try {
    const username = String(req.params.username || "").trim();
    if (!username) return res.status(400).send("Username is required");

    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found");

    const {
      password,
      resetPasswordToken,
      resetPasswordExpiry,
      __v,
      ...publicData
    } = user._doc;
    return res.status(200).json(publicData);
  } catch {
    return res.status(500).send("Something went wrong!");
  }
};

// Public: check if a username is available
export const checkUsernameAvailability = async (req, res) => {
  try {
    const raw = String(req.query.username || "");
    const username = raw.trim().toLowerCase();
    if (!username)
      return res
        .status(400)
        .json({ available: false, reason: "Username is required" });

    // Basic allowlist: letters, numbers, underscore, dot, dash; 3-24 chars
    if (!/^[a-z0-9._-]{3,24}$/.test(username)) {
      return res
        .status(400)
        .json({ available: false, reason: "Invalid username format" });
    }

    const exists = await User.exists({ username });
    return res.status(200).json({ available: !exists });
  } catch {
    return res.status(500).json({ available: false, reason: "Server error" });
  }
};

// Secure: update own username (unique, normalized)
export const updateUsername = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).send("User not found");

    const raw = String(req.body.username || "");
    const nextUsername = raw.trim().toLowerCase();
    if (!nextUsername) return res.status(400).send("Username is required");
    if (!/^[a-z0-9._-]{3,24}$/.test(nextUsername)) {
      return res.status(400).send("Invalid username format");
    }

    // If unchanged
    if (nextUsername === user.username) {
      const {
        password,
        resetPasswordToken,
        resetPasswordExpiry,
        __v,
        ...publicData
      } = user._doc;
      return res.status(200).json(publicData);
    }

    // Uniqueness
    const taken = await User.exists({ username: nextUsername });
    if (taken) return res.status(409).send("Username already taken");

    user.username = nextUsername;
    const saved = await user.save();

    const {
      password,
      resetPasswordToken,
      resetPasswordExpiry,
      __v,
      ...publicData
    } = saved._doc;
    return res.status(200).json(publicData);
  } catch (error) {
    return res.status(500).send("Something went wrong!");
  }
};

export const getUsers = async (req, res) => {
  try {
    // 🔐 Admin check
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};
