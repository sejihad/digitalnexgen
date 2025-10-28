import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
});

export default mongoose.model("Coupon", couponSchema);
