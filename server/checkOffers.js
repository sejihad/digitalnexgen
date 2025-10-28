import mongoose from "mongoose";
import dotenv from "dotenv";
import PromotionalOffer from "./models/promotionalOffer.model.js";

dotenv.config();

const checkOffers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("✅ DB Connected");

    const allOffers = await PromotionalOffer.find({});
    console.log("\n📊 Total Offers in DB:", allOffers.length);
    
    if (allOffers.length > 0) {
      console.log("\n📋 Offers Details:");
      allOffers.forEach((offer, index) => {
        console.log(`\n${index + 1}. ${offer.title}`);
        console.log(`   - ID: ${offer._id}`);
        console.log(`   - Active: ${offer.isActive}`);
        console.log(`   - Start: ${offer.startDate}`);
        console.log(`   - End: ${offer.endDate}`);
        console.log(`   - Features: ${offer.features.length}`);
      });
    } else {
      console.log("\n❌ No offers found in database!");
    }

    await mongoose.disconnect();
    console.log("\n✅ DB Disconnected");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

checkOffers();
