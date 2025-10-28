import Gallery from "../models/gallery.model.js";
import createError from "../utils/createError.js";

export const createGallery = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can create gallery"));
  }

  const newGallery = new Gallery(req.body);

  try {
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

export const deleteGallery = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can delete gallery"));
    }

    const galleryId = req.params.id;

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) {
      return next(createError(403, "Image not found!"));
    }
    await Gallery.findByIdAndDelete(galleryId);

    res.status(200).send("Image deleted successfully");
  } catch (error) {
    next(error);
  }
};
