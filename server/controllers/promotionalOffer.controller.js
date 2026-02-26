import deleteFromS3 from "../config/deleteFromS3.js";
import uploadToS3 from "../config/uploadToS3.js";
import PromotionalOffer from "../models/promotionalOffer.model.js";

// Create a new promotional offer (Admin only)
export const createPromotionalOffer = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can create promotional offers." });
    }

    // 🖼️ 1️⃣ Image upload (optional)
    let image;

    if (req.files && req.files.image) {
      const imageFile = req.files.image; // single file
      const uploadedImage = await uploadToS3(imageFile, "promotional-offers");

      image = {
        public_id: uploadedImage.key,
        url: uploadedImage.url,
      };
    }

    // 🧩 2️⃣ Create Offer Document
    const newOffer = new PromotionalOffer({
      title: req.body.title,
      description: req.body.description,
      discount: req.body.discount,
      originalPrice: Number(req.body.originalPrice),
      offerPrice: Number(req.body.offerPrice),

      offerPrices: req.body.offerPrices ? JSON.parse(req.body.offerPrices) : {},

      features: req.body.features ? JSON.parse(req.body.features) : [],

      badge: req.body.badge || "Special Offer",
      isActive: req.body.isActive !== "false",
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      serviceId: req.body.serviceId || null,
      category: req.body.category || "General",
      order: Number(req.body.order || 0),

      ...(image && { image }), // ✅ image থাকলে তবেই set
    });

    // 💾 3️⃣ Save to DB
    const savedOffer = await newOffer.save();

    res.status(201).json({
      success: true,
      offer: savedOffer,
    });
  } catch (error) {
    next(error);
  }
};

// Get all promotional offers (Public - only active offers)
export const getPromotionalOffers = async (req, res, next) => {
  try {
    // Check if request is from admin panel (you can pass ?admin=true in query)
    const isAdminRequest = req.query.admin === "true" || req.isAdmin;

    // If admin, show all offers; otherwise, only active offers that haven't expired
    const filter = isAdminRequest
      ? {}
      : {
          isActive: true,
          endDate: { $gt: new Date() }, // Only get offers that haven't expired
        };

    const offers = await PromotionalOffer.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .populate("serviceId");

    res.status(200).json(offers);
  } catch (error) {
    next(error);
  }
};

// Get latest active promotional offer (Public)
export const getLatestPromotionalOffer = async (req, res, next) => {
  try {
    const today = new Date();

    const latestOffer = await PromotionalOffer.findOne({
      isActive: true,
      endDate: { $gt: today },
    })
      .sort({ createdAt: -1 }) // latest first
      .populate("serviceId");

    if (!latestOffer) {
      return res.status(200).json(null);
    }

    res.status(200).json(latestOffer);
  } catch (error) {
    next(error);
  }
};

// Get single promotional offer by ID
export const getPromotionalOfferById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await PromotionalOffer.findById(id).populate("serviceId");

    if (!offer) {
      return res.status(404).json({ message: "Promotional offer not found." });
    }

    res.status(200).json(offer);
  } catch (error) {
    next(error);
  }
};

// Update promotional offer (Admin only)
export const updatePromotionalOffer = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can update promotional offers." });
    }

    const { id } = req.params;

    // 1️⃣ Find offer first (needed to delete old image)
    const offer = await PromotionalOffer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Promotional offer not found." });
    }

    let image = offer.image; // existing image

    // 2️⃣ Handle new image (optional)
    if (req.files?.image) {
      // Delete old image from S3 if exists
      if (image?.public_id) {
        await deleteFromS3(image.public_id);
      }

      // Upload new image
      const uploadedImage = await uploadToS3(
        req.files.image,
        "promotional-offers",
      );
      image = {
        public_id: uploadedImage.key,
        url: uploadedImage.url,
      };
    }

    // 3️⃣ Parse JSON fields if they come as string (multipart হলে string আসে)
    if (req.body.offerPrices && typeof req.body.offerPrices === "string") {
      req.body.offerPrices = JSON.parse(req.body.offerPrices);
    }

    if (req.body.features && typeof req.body.features === "string") {
      req.body.features = JSON.parse(req.body.features);
    }

    // 4️⃣ Convert numeric fields safely (optional but recommended)
    if (req.body.originalPrice !== undefined) {
      req.body.originalPrice = Number(req.body.originalPrice);
    }
    if (req.body.offerPrice !== undefined) {
      req.body.offerPrice = Number(req.body.offerPrice);
    }
    if (req.body.order !== undefined) {
      req.body.order = Number(req.body.order);
    }

    // 5️⃣ Checkbox value comes as string in multipart
    if (req.body.isActive !== undefined) {
      req.body.isActive = req.body.isActive !== "false";
    }

    // 6️⃣ Update DB
    const updatedOffer = await PromotionalOffer.findByIdAndUpdate(
      id,
      {
        ...req.body,
        ...(image ? { image } : {}), // image থাকলে set, না থাকলে unchanged
      },
      { new: true },
    ).populate("serviceId");

    res.status(200).json(updatedOffer);
  } catch (error) {
    next(error);
  }
};
// Delete promotional offer (Admin only)
export const deletePromotionalOffer = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can delete promotional offers." });
    }

    const offer = await PromotionalOffer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Promotional offer not found." });
    }

    // ✅ Delete image from S3 if exists
    if (offer.image?.public_id) {
      await deleteFromS3(offer.image.public_id);
    }

    // ✅ Delete offer from DB
    await PromotionalOffer.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json({ message: "Promotional offer deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// Toggle offer active status (Admin only)
export const toggleOfferStatus = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can toggle offer status." });
    }

    const { id } = req.params;
    const offer = await PromotionalOffer.findById(id);

    if (!offer) {
      return res.status(404).json({ message: "Promotional offer not found." });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.status(200).json(offer);
  } catch (error) {
    next(error);
  }
};
