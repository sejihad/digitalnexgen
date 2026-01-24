import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    provider: {
      type: String,
      default: "local",
    },
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      sparse: true,
    },
    password: {
      type: String,
    },
    img: {
      url: { type: String },
      public_id: { type: String },
    },
    country: {
      type: String,
    },
    phone: {
      type: String,
    },
    number: {
      type: String,
    },
    desc: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: true,
    },
    twoFactorCode: String,
    twoFactorExpire: Date,
  },
  {
    timestamps: true,
  },
);

userSchema.index({ username: 1, provider: 1 }, { unique: true });

userSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.model("User", userSchema);
