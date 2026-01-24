import Coupon from "../models/coupon.model.js";

// ✅ Add Coupon
export const addCoupon = async (req, res) => {
  try {
    const { code, discountValue } = req.body;

    // Validate required fields
    if (!code || !discountValue) {
      return res
        .status(400)
        .json({ message: "Code and discount value are required" });
    }

    // Check if coupon already exists
    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "Coupon already exists" });
    }

    // Create new coupon
    const newCoupon = new Coupon({
      code: code.toUpperCase().trim(),
      discountValue: Number(discountValue),
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const { code, discountValue } = req.body;

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        ...(code && { code: code.toUpperCase().trim() }),
        ...(discountValue && { discountValue: Number(discountValue) }),
      },
      { new: true, runValidators: true },
    );

    if (!updatedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(updatedCoupon);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// ✅ Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Delete failed", error: err.message });
  }
};

// ✅ Get All Coupons
export const allCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch coupons", error: err.message });
  }
};

// controller: verifyCoupon.js
export const verifyCoupon = async (req, res) => {
  const { code, price } = req.body;

  if (!code || !price) {
    return res
      .status(400)
      .json({ valid: false, message: "Code and price required" });
  }

  const coupon = await Coupon.findOne({
    code: { $regex: `^${code}$`, $options: "" },
  });

  if (!coupon) {
    return res.json({ valid: false });
  }

  const discountAmount = parseFloat((price * coupon.discountValue) / 100);
  const finalPrice = parseFloat(price - discountAmount);

  res.json({
    valid: true,
    discountValue: coupon.discountValue,
    discountAmount,
    finalPrice,
  });
};
