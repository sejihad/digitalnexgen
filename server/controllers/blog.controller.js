import deleteFromS3 from "../config/deleteFromS3.js";
import uploadToS3 from "../config/uploadToS3.js";
import Blog from "../models/blog.model.js";
import createError from "../utils/createError.js";

export const createBlog = async (req, res, next) => {
  if (!req.isAdmin) {
    return next(createError(403, "Only Admin can create blogs"));
  }

  try {
    if (!req.files || !req.files.images) {
      return next(createError(400, "Images are required"));
    }

    const files = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    const images = []; // ✅ define images array

    for (const file of files) {
      const uploaded = await uploadToS3(file, "blogs");

      images.push({
        public_id: uploaded.key,
        url: uploaded.url,
      });
    }

    const newBlog = new Blog({
      title: req.body.title,
      description: req.body.description,
      images, // ✅ attach uploaded images
    });

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

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(createError(404, "No blog found!"));
    }

    // 🟢 Update text fields
    blog.title = req.body.title || blog.title;
    blog.description = req.body.description || blog.description;

    // 🟢 If new images provided
    if (req.files && req.files.images) {
      // 1️⃣ Delete old images
      for (const img of blog.images) {
        if (img.public_id) {
          await deleteFromS3(img.public_id);
        }
      }

      // 2️⃣ Upload new images
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      const uploadedImages = [];

      for (const file of files) {
        const uploaded = await uploadToS3(file, "blogs");
        uploadedImages.push({
          public_id: uploaded.key,
          url: uploaded.url,
        });
      }

      blog.images = uploadedImages;
    }

    const updatedBlog = await blog.save();
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

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(createError(404, "Blog not found!"));
    }

    // 🟢 Delete images from S3
    if (blog.images && blog.images.length > 0) {
      for (const img of blog.images) {
        if (img.public_id) {
          await deleteFromS3(img.public_id);
        }
      }
    }

    // 🟢 Delete blog from DB
    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    next(createError(500, "Internal Server Error!"));
  }
};
