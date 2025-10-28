import Partner from "../models/partner.model.js";
import createError from "../utils/createError.js";

// ✅ Create a new partner (Admin only)
export const createPartner = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can add partners!"));
  }

  const newPartner = new Partner(req.body);

  try {
    const savedPartner = await newPartner.save();
    res.status(201).json(savedPartner);
  } catch (error) {
    next(createError(500, "Server error while creating partner"));
  }
};

// ✅ Get all partners
export const getPartners = async (req, res, next) => {
  try {
    const partners = await Partner.find();
    res.status(200).json(partners);
  } catch (error) {
    next(createError(500, "Server error while fetching partners"));
  }
};

// ✅ Get a single partner by ID
export const getPartner = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) return next(createError(404, "Partner not found"));
    res.status(200).json(partner);
  } catch (error) {
    next(createError(500, "Server error while fetching partner"));
  }
};

// ✅ Update partner (Admin only)
export const updatePartner = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can update partners!"));
  }

  try {
    const updatedPartner = await Partner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPartner) return next(createError(404, "Partner not found"));
    res.status(200).json(updatedPartner);
  } catch (error) {
    next(createError(500, "Server error while updating partner"));
  }
};

// ✅ Delete partner (Admin only)
export const deletePartner = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can delete partners!"));
  }

  try {
    await Partner.findByIdAndDelete(req.params.id);
    res.status(200).send("Partner deleted successfully");
  } catch (error) {
    next(createError(500, "Server error while deleting partner"));
  }
};
