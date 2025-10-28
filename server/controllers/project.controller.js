import Project from "../models/project.model.js";
import createError from "../utils/createError.js";

export const createProject = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can create projects"));
  }

  const newProject = new Project(req.body);

  try {
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    next(createError(500, "Server error"));
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
      return next(createError(404, "No project found!"));
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedProject);
  } catch (error) {
    next(createError(500, "Internal Server Error!"));
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only Admin can delete projects!"));
    }
    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Project has been deleted successfully" });
  } catch (error) {
    next(createError(500, "Internal Server error!"));
  }
};
