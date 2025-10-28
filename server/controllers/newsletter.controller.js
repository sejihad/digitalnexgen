import Newsletter from "../models/newsletter.model.js";
import createError from "../utils/createError.js";

// ✅ Create new subscription
export const createSubscription = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(createError(400, "Email is required"));
    }

    // check if email already exists
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return next(createError(400, "Email already subscribed"));
    }

    const newSub = new Newsletter({ email });
    const savedSub = await newSub.save();

    res.status(201).json(savedSub);
  } catch (error) {
    
    next(createError(500, "Server error"));
  }
};

// ✅ Get all subscriptions (Admin only)
export const getSubscriptions = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only Admin can view subscribers"));
    }

    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.status(200).json(subscribers);
  } catch (error) {
  
    next(createError(500, "Internal server error"));
  }
};

// ✅ Delete a subscription (Admin only)
export const deleteSubscription = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only Admin can delete subscribers"));
    }

    const sub = await Newsletter.findByIdAndDelete(req.params.id);
    if (!sub) {
      return next(createError(404, "Subscriber not found"));
    }

    res.status(200).send("Subscriber deleted successfully");
  } catch (error) {

    next(createError(500, "Internal server error"));
  }
};
