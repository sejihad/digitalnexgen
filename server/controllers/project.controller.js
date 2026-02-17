import deleteFromS3 from "../config/deleteFromS3.js";
import uploadToS3 from "../config/uploadToS3.js";
import Project from "../models/project.model.js";
import createError from "../utils/createError.js";

export const createProject = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can create projects"));
  }

  try {
    // ✅ required fields check
    const { title, description, category, subCategory } = req.body;

    if (!title || !description || !category || !subCategory) {
      return next(createError(400, "Missing required project fields"));
    }

    // ✅ image check
    if (!req.files || !req.files.images) {
      return next(createError(400, "At least one project image is required"));
    }

    // 🔥 normalize images (single → array)
    const imageFiles = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    const images = [];

    for (const file of imageFiles) {
      const uploaded = await uploadToS3(file, "projects/images");
      images.push({
        public_id: uploaded.key,
        url: uploaded.url,
      });
    }

    // ✅ create project
    const newProject = new Project({
      title,
      description,
      category,
      subCategory,
      client: req.body.client || "",
      tags: req.body.tags ? req.body.tags.split(",").map((t) => t.trim()) : [],
      technologies: req.body.technologies
        ? req.body.technologies.split(",").map((t) => t.trim())
        : [],
      url: req.body.url || "",
      videoUrl: req.body.videoUrl || "",
      images,
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    next(createError(500, "Server error while creating project"));
  }
};

// ✅ Updated getProjects with subCategory filter
export const getProjects = async (req, res, next) => {
  try {
    const { title, subcategory } = req.query;

    const filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (subcategory) {
      filter.subCategory = { $regex: subcategory, $options: "i" };
    }

    const projects = await Project.find(filter);
    res.status(200).json(projects);
  } catch (error) {
    next(createError(500, "Internal server error"));
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(createError(404, "No project found"));
    }
    res.status(200).json(project);
  } catch (error) {
    next(createError(500, "Internal server error"));
  }
};

export const updateProject = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can update projects!"));
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(createError(404, "Project not found"));
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      subCategory: req.body.subCategory,
      client: req.body.client || "",
      url: req.body.url || "",
      videoUrl: req.body.videoUrl || "",
      tags: req.body.tags ? req.body.tags.split(",").map((t) => t.trim()) : [],
      technologies: req.body.technologies
        ? req.body.technologies.split(",").map((t) => t.trim())
        : [],
    };

    // 🧠 existing images (keep)
    let images = [];
    if (req.body.existingImages) {
      images = JSON.parse(req.body.existingImages);
    }

    // 🔥 new uploaded images
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of imageFiles) {
        const uploaded = await uploadToS3(file, "projects/images");
        images.push({
          public_id: uploaded.key,
          url: uploaded.url,
        });
      }
    }

    updateData.images = images;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    res.status(200).json(updatedProject);
  } catch (error) {
    next(createError(500, "Server error while updating project"));
  }
};

// Delete project
export const deleteProject = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can delete projects"));
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(createError(404, "Project not found"));
    }

    // 🔥 Delete images from S3
    if (Array.isArray(project.images) && project.images.length > 0) {
      await Promise.all(
        project.images.map((img) => {
          if (img?.public_id) {
            return deleteFromS3(img.public_id);
          }
        }),
      );
    }

    // 🗑️ Delete project from DB
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(createError(500, "Server error while deleting project"));
  }
};
