import PromotionalOffer from "../models/promotionalOffer.model.js";

// Create a new promotional offer (Admin only)
export const createPromotionalOffer = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can create promotional offers." });
    }

    const newOffer = new PromotionalOffer(req.body);
    const savedOffer = await newOffer.save();

    res.status(201).json(savedOffer);
  } catch (error) {
    console.error("Error creating promotional offer:", error);
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
    console.error("Error fetching promotional offers:", error);
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
    console.error("Error fetching latest promotional offer:", error);
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
    console.error("Error fetching promotional offer:", error);
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
    const updatedOffer = await PromotionalOffer.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    ).populate("serviceId");

    if (!updatedOffer) {
      return res.status(404).json({ message: "Promotional offer not found." });
    }

    res.status(200).json(updatedOffer);
  } catch (error) {
    console.error("Error updating promotional offer:", error);
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

    const { id } = req.params;
    const deletedOffer = await PromotionalOffer.findByIdAndDelete(id);

    if (!deletedOffer) {
      return res.status(404).json({ message: "Promotional offer not found." });
    }

    res
      .status(200)
      .json({ message: "Promotional offer deleted successfully." });
  } catch (error) {
    console.error("Error deleting promotional offer:", error);
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
    console.error("Error toggling offer status:", error);
    next(error);
  }
};
