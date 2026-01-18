import dotenv from "dotenv";
import mongoose from "mongoose";
import PromotionalOffer from "./models/promotionalOffer.model.js";

dotenv.config();

const checkOffers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);

    const allOffers = await PromotionalOffer.find({});

    if (allOffers.length > 0) {
      allOffers.forEach((offer, index) => {});
    } else {
    }

    await mongoose.disconnect();
  } catch (error) {}
};

checkOffers();
