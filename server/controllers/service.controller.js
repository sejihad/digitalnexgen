import deleteFromS3 from "../config/deleteFromS3.js";
import uploadToS3 from "../config/uploadToS3.js";
import Service from "../models/service.model.js";
import createError from "../utils/createError.js";

export const createService = async (req, res, next) => {
  if (!req.isAdmin)
    return next(createError(403, "Only admin can create a service"));

  try {
    // 1️⃣ Cover Image চেক
    if (!req.files || !req.files.coverImage) {
      return res.status(400).json({
        success: false,
        message: "Cover image is required",
      });
    }

    // 2️⃣ Cover Image Upload
    const coverFile = req.files.coverImage; // single file
    const uploadedCover = await uploadToS3(coverFile, "services/cover");
    const coverImage = {
      public_id: uploadedCover.key,
      url: uploadedCover.url,
    };

    // 3️⃣ Other Images Upload (optional, unlimited)
    let otherImages = [];
    if (req.files.otherImages && req.files.otherImages.length > 0) {
      const files = Array.isArray(req.files.otherImages)
        ? req.files.otherImages
        : [req.files.otherImages];

      for (const file of files) {
        const uploaded = await uploadToS3(file, "services/other");
        otherImages.push({
          public_id: uploaded.key,
          url: uploaded.url,
        });
      }
    }

    // 4️⃣ Create Service Document
    const newService = new Service({
      userId: req.userId,
      title: req.body.title,
      desc: req.body.desc,
      shortTitle: req.body.shortTitle,
      shortDesc: req.body.shortDesc,
      category: req.body.category,
      subCategory: req.body.subCategory,
      features: req.body.features ? JSON.parse(req.body.features) : [],
      packages: req.body.packages ? JSON.parse(req.body.packages) : [],
      videoUrl: req.body.videoUrl || "", // ✅ Video URL add
      coverImage,
      otherImages,
    });

    // 5️⃣ Save to DB
    const savedService = await newService.save();
    res.status(201).json({
      success: true,
      service: savedService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    next(createError(500, "Internal server error"));
  }
};
export const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return next(createError(404, "No service found"));

    res.status(200).send(service);
  } catch (error) {
    next(error);
  }
};

export const getServices = async (req, res, next) => {
  const q = req.query;
  const filters = {
    ...(q.category && { category: q.category }),
    ...(q.subcategory && {
      subCategory: { $regex: q.subcategory, $options: "i" },
    }),
    ...(q.search && {
      $or: [
        { title: { $regex: q.search, $options: "i" } },
        { category: { $regex: q.search, $options: "i" } },
        { subCategory: { $regex: q.search, $options: "i" } },
      ],
    }),
  };

  try {
    const services = await Service.find(filters);
    res.status(200).send(services);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) return next(createError(404, "No service found"));

    if (service.userId !== req.userId && !req.isAdmin) {
      return next(
        createError(403, "You are not allowed to update this service")
      );
    }
    let coverImage = service.coverImage;
    let otherImages = service.otherImages || [];

    // 1️⃣ Handle new cover image
    if (req.files?.coverImage) {
      // Delete old cover from S3 if exists
      if (coverImage?.public_id) await deleteFromS3(coverImage.public_id);

      const uploadedCover = await uploadToS3(
        req.files.coverImage,
        "services/cover"
      );
      coverImage = {
        public_id: uploadedCover.key,
        url: uploadedCover.url,
      };
    }

    // 2️⃣ Handle other images
    if (req.files?.otherImages && req.files.otherImages.length > 0) {
      // Delete old other images from S3
      for (const img of otherImages) {
        if (img.public_id) await deleteFromS3(img.public_id);
      }

      // Upload new other images
      const files = Array.isArray(req.files.otherImages)
        ? req.files.otherImages
        : [req.files.otherImages];
      otherImages = [];
      for (const file of files) {
        const uploaded = await uploadToS3(file, "services/other");
        otherImages.push({ public_id: uploaded.key, url: uploaded.url });
      }
    }
    if (req.body.packages && typeof req.body.packages === "string") {
      req.body.packages = JSON.parse(req.body.packages);
    }

    if (req.body.features && typeof req.body.features === "string") {
      req.body.features = JSON.parse(req.body.features);
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        coverImage,
        otherImages,
      },
      {
        new: true,
      }
    );

    res.status(200).json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    next(createError(500, "Internal server error"));
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) return next(createError(404, "Service not found"));

    if (service.userId !== req.userId && !req.isAdmin) {
      return next(
        createError(403, "You are not allowed to delete this service")
      );
    }
    if (service.coverImage) {
      // Delete old cover from S3 if exists
      if (service.coverImage?.public_id)
        await deleteFromS3(service.coverImage.public_id);
    }

    // 2️⃣ Handle other images
    if (service.otherImages && service.otherImages.length > 0) {
      // Delete old other images from S3
      for (const img of service.otherImages) {
        if (img.public_id) await deleteFromS3(img.public_id);
      }
    }

    await Service.findByIdAndDelete(req.params.id);
    res.status(200).send("Service has been deleted.");
  } catch (error) {
    console.error("Error deleting service:", error);
    next(createError(500, "Internal server error"));
  }
};

export const countServices = async (req, res, next) => {
  try {
    const totalServices = await Service.countDocuments();
    res.status(200).json({ totalServices });
  } catch (error) {
    console.error("Error fetching service count:", error);
    next(createError(500, "Internal server error"));
  }
};
