import deleteFromS3 from "../config/deleteFromS3.js";
import uploadToS3 from "../config/uploadToS3.js";
import Partner from "../models/partner.model.js";
import createError from "../utils/createError.js";

// ✅ Create a new partner (Admin only)
export const createPartner = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only Admin can add partners!"));
    }
    if (!req.files || !req.files.logo) {
      return res.status(400).json({
        success: false,
        message: "Logo is required",
      });
    }

    // 2️⃣ Logo Upload
    const logoFile = req.files.logo; // single file
    const uploadedLogo = await uploadToS3(logoFile, "partners/logo");
    const logo = {
      public_id: uploadedLogo.key,
      url: uploadedLogo.url,
    };

    const newPartner = new Partner({
      ...req.body,
      logo,
    });

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
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return next(createError(404, "Partner not found"));
    }

    const updateData = {};

    // ✅ text fields (only if sent)
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.website !== undefined) updateData.website = req.body.website;

    // ✅ logo update (only if new file sent)
    if (req.files?.logo) {
      if (partner.logo?.public_id) {
        await deleteFromS3(partner.logo.public_id);
      }

      const uploadedLogo = await uploadToS3(req.files.logo, "partners/logo");

      updateData.logo = {
        public_id: uploadedLogo.key,
        url: uploadedLogo.url,
      };
    }

    const updatedPartner = await Partner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

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
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return next(createError(404, "Partner not found"));
    }
    if (partner.logo?.public_id) {
      await deleteFromS3(partner.logo.public_id);
    }
    await Partner.findByIdAndDelete(req.params.id);
    res.status(200).send("Partner deleted successfully");
  } catch (error) {
    next(createError(500, "Server error while deleting partner"));
  }
};
