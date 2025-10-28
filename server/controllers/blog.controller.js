import Blog from "../models/blog.model.js";
import createError from "../utils/createError.js";

export const createBlog = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can create blogs"));
  }

  const newBlog = new Blog(req.body);

  try {
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
   
    next(createError(500, "Server error"));
  }
};

export const getBlogs = async (req, res, next) => {
  try {
    const { title } = req.query;

    const filter = title ? { title: { $regex: title, $options: "i" } } : {};

    const blogs = await Blog.find(filter);
    res.status(200).send(blogs);
  } catch (error) {
  ;
    next(createError(500, "Internal server error"));
  }
};

export const getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(createError(404, "No blog found"));
    }
    res.status(200).send(blog);
  } catch (error) {
   
    next(createError(500, "Internal server error"));
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can update blogs!"));
    }

    const blog = Blog.findById(req.params.id);
    if (!blog) {
      return next(createError(404, "No blog found!"));
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updatedBlog);
  } catch (error) {
   
    next(createError(500, "Internal Server Error!"));
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only Admin can delete blogs!"));
    }
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).send("Blog has been deleted successfully");
  } catch (error) {

    next(createError(500, "Internal Server error!"));
  }
};
