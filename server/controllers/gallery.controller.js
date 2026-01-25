import deleteFromS3 from "../config/deleteFromS3.js";
import uploadToS3 from "../config/uploadToS3.js";
import Gallery from "../models/gallery.model.js";
import createError from "../utils/createError.js";

export const createGallery = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can create gallery"));
  }

  try {
    // 🔥 validation: file must be sent
    if (!req.files.image) {
      return next(createError(400, "Image is required"));
    }

    // 🔥 upload image to S3 (or local storage)
    const uploadedImage = await uploadToS3(req.files.image, "galleries/images");

    // 🔥 build gallery object
    const galleryData = {
      imageTitle: req.body.imageTitle,
      category: req.body.category,
      gitUrl: req.body.gitUrl || "",
      serviceId: req.body.serviceId || "",
      image: {
        public_id: uploadedImage.key,
        url: uploadedImage.url,
      },
    };

    const newGallery = new Gallery(galleryData);
    const savedGallery = await newGallery.save();

    return res.status(201).json(savedGallery);
  } catch (error) {
    next(error);
  }
};

export const getGalleries = async (req, res, next) => {
  try {
    const { category } = req.query;

    const filter = category ? { category } : {};

    const galleries = await Gallery.find(filter);

    res.status(200).json(galleries);
  } catch (error) {
    next(error);
  }
};

// ✅ Get a single gallery item by ID
export const getGallery = async (req, res, next) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return next(createError(404, "Gallery item not found"));
    res.status(200).json(gallery);
  } catch (error) {
    next(createError(500, "Server error while fetching gallery item"));
  }
};

// ✅ Update gallery item (Admin only)
export const updateGallery = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can update gallery items!"));
  }

  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return next(createError(404, "Gallery item not found"));
    }

    const updateData = {};

    // ✅ text fields (only if sent)
    if (req.body.imageTitle) updateData.imageTitle = req.body.imageTitle;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.gitUrl !== undefined) updateData.gitUrl = req.body.gitUrl;
    if (req.body.serviceId !== undefined)
      updateData.serviceId = req.body.serviceId;

    // ✅ image update (only if new file sent)
    if (req.files?.image) {
      // delete old image from S3 if exists
      if (gallery.image?.public_id) {
        await deleteFromS3(gallery.image.public_id);
      }

      const uploadedImage = await uploadToS3(
        req.files.image,
        "galleries/images",
      );

      updateData.image = {
        public_id: uploadedImage.key,
        url: uploadedImage.url,
      };
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    res.status(200).json(updatedGallery);
  } catch (error) {
    next(createError(500, "Server error while updating gallery item"));
  }
};

// ✅ Delete gallery (Admin only)
export const deleteGallery = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can delete partners!"));
  }

  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return next(createError(404, "Gallery not found"));
    }
    if (gallery.image?.public_id) {
      await deleteFromS3(gallery.image.public_id);
    }
    await Gallery.findByIdAndDelete(req.params.id);
    res.status(200).send("Gallery deleted successfully");
  } catch (error) {
    next(createError(500, "Server error while deleting gallery"));
  }
};
