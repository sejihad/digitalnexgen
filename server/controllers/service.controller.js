import Service from "../models/service.model.js";
import createError from "../utils/createError.js";

export const createService = async (req, res, next) => {
  if (!req.isAdmin)
    return next(createError(403, "Only admin can create a service"));

  const newService = new Service({
    userId: req.userId,
    ...req.body,
  });

  try {
    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (error) {
    console.error("Error saving service:", error);
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

  console.log("Filters applied:", filters);

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

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
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
