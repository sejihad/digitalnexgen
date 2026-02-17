import Offer from "../models/offer.model.js";

export const createOffer = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can create offers." });
    }

    const { conversationId, buyerId, offerDetails } = req.body;

    const newOffer = new Offer({
      conversationId,
      adminId: req.userId,
      buyerId,
      offerDetails,
    });

    const savedOffer = await newOffer.save();
    res.status(201).json(savedOffer);
  } catch (error) {
    next(error);
  }
};

export const getOffers = async (req, res, next) => {
  try {
    const filters = req.isAdmin
      ? { adminId: req.userId }
      : { buyerId: req.userId };

    if (req.query.conversationId) {
      filters.conversationId = req.query.conversationId;
    }

    const offers = await Offer.find(filters).sort("-createdAt");

    res.status(200).json(offers);
  } catch (error) {
    next(error);
  }
};

export const respondToOffer = async (req, res, next) => {
  try {
    if (req.isAdmin) {
      return res
        .status(403)
        .json({ message: "Admins cannot respond to offers." });
    }

    const { offerId } = req.params;
    const { status } = req.body;

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const updatedOffer = await Offer.findOneAndUpdate(
      { _id: offerId, buyerId: req.userId },
      { $set: { status } },
      { new: true },
    );

    if (!updatedOffer) {
      return res.status(404).json({ message: "Offer not found." });
    }

    res.status(200).json(updatedOffer);
  } catch (error) {
    next(error);
  }
};
