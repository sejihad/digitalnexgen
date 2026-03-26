import mongoose from "mongoose";
import deleteFromS3 from "../config/deleteFromS3.js";
import uploadToS3 from "../config/uploadToS3.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import ReviewRequest from "../models/reviewRequest.model.js";
import Service from "../models/service.model.js";
import User from "../models/user.model.js";
import { getIO } from "../socketInstance.js";
import createError from "../utils/createError.js";
const getPopulatedUserImage = (user) => {
  if (!user) {
    return {
      url: "",
      public_id: "",
    };
  }

  if (user.img) {
    return {
      url: user.img.url || "",
      public_id: user.img.public_id || "",
    };
  }

  return {
    url: "",
    public_id: "",
  };
};

const formatReview = (review) => {
  const populatedUser = review.userId;

  return {
    _id: review._id,
    serviceId: review.serviceId?._id || review.serviceId || null,
    orderId: review.orderId || null,
    userId: populatedUser?._id || null,
    sellerId: review.sellerId || null,
    star: review.star,
    desc: review.desc,
    isVisible: review.isVisible,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    country: review.country,
    reviewDate: review.reviewDate,
    name: populatedUser?.name || review.name || "Anonymous",
    userImage: populatedUser
      ? getPopulatedUserImage(populatedUser)
      : review.userImage || { url: "", public_id: "" },
  };
};

const recalculateServiceRating = async (serviceId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        serviceId: new mongoose.Types.ObjectId(serviceId),
        isVisible: true,
      },
    },
    {
      $group: {
        _id: "$serviceId",
        totalStars: { $sum: "$star" },
        starNumber: { $sum: 1 },
        averageStars: { $avg: "$star" },
      },
    },
  ]);

  await Service.findByIdAndUpdate(serviceId, {
    totalStars: stats[0]?.totalStars || 0,
    starNumber: stats[0]?.starNumber || 0,
    averageStars: stats[0]?.averageStars || 0,
  });
};

// USER CREATE REVIEW
export const createReview = async (req, res, next) => {
  try {
    const { orderId, star, desc, reviewDate } = req.body;

    if (!req.userId) {
      return next(createError(401, "You are not authenticated"));
    }

    if (!orderId || !star || !desc?.trim()) {
      return next(createError(400, "orderId, star and desc are required"));
    }
    const user = await User.findById(req.userId);
    const numericStar = Number(star);

    if (Number.isNaN(numericStar) || numericStar < 1 || numericStar > 5) {
      return next(createError(400, "Star must be between 1 and 5"));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(createError(404, "Order not found"));
    }

    if (order.user?.id !== req.userId) {
      return next(createError(403, "You are not allowed to review this order"));
    }

    if (order.order_status !== "completed") {
      return next(createError(400, "Only completed orders can be reviewed"));
    }

    if (!order.isReviewEligible) {
      return next(
        createError(400, "This order is not eligible for review yet"),
      );
    }

    if (order.isReviewed) {
      return next(createError(400, "Review already submitted for this order"));
    }

    const existingReview = await Review.findOne({ orderId: order._id });

    if (existingReview) {
      return next(createError(400, "Review already exists for this order"));
    }

    if (
      !order.service?.id ||
      !mongoose.Types.ObjectId.isValid(order.service.id)
    ) {
      return next(createError(400, "Invalid service id in order"));
    }

    const service = await Service.findById(order.service.id);

    if (!service) {
      return next(createError(404, "Service not found"));
    }

    const review = await Review.create({
      serviceId: service._id,
      orderId: order._id,
      userId: req.userId,
      sellerId: service.userId,
      star: numericStar,
      desc: desc.trim(),
      reviewDate: reviewDate || Date.now(),
      country: user?.country || "",
      createdSource: "user",
    });

    order.isReviewed = true;
    order.reviewedAt = new Date();
    await order.save();

    const updatedRequest = await ReviewRequest.findOneAndUpdate(
      { orderId: order._id },
      {
        $set: {
          status: "reviewed",
          reviewId: review._id,
          reviewedAt: new Date(),
        },
      },
      { new: true },
    );

    await recalculateServiceRating(service._id);

    const io = getIO();

    if (io && updatedRequest) {
      io.to(String(updatedRequest.conversationId)).emit(
        "reviewRequest:update",
        {
          conversationId: String(updatedRequest.conversationId),
          reviewRequest: updatedRequest,
        },
      );

      io.to(`user:${String(order.user?.id || req.userId)}`).emit(
        "reviewRequest:update",
        {
          conversationId: String(updatedRequest.conversationId),
          reviewRequest: updatedRequest,
        },
      );

      io.to("admins").emit("admin:conversation:update", {
        conversationId: String(updatedRequest.conversationId),
        type: "review-request-reviewed",
        reviewRequest: updatedRequest,
      });
    }

    return res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("createReview error:", error);
    return next(createError(500, "Server error while creating review"));
  }
};

// ADMIN CREATE REVIEW
export const adminCreateReview = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can create reviews"));
    }

    const { serviceId, star, desc, name, reviewDate, country } = req.body;

    if (!serviceId || !star || !desc?.trim() || !name?.trim()) {
      return next(
        createError(400, "serviceId, name, star and desc are required"),
      );
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return next(createError(400, "Invalid service id"));
    }

    const numericStar = Number(star);

    if (Number.isNaN(numericStar) || numericStar < 1 || numericStar > 5) {
      return next(createError(400, "Star must be between 1 and 5"));
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return next(createError(404, "Service not found"));
    }

    let imageData = {
      url: "",
      public_id: "",
    };

    if (req.files?.image) {
      const uploaded = await uploadToS3(req.files.image, "reviews/images");
      imageData = {
        url: uploaded.url,
        public_id: uploaded.key,
      };
    }

    const review = await Review.create({
      serviceId,
      sellerId: service.userId,
      name: name.trim(),
      userImage: imageData,
      star: numericStar,
      desc: desc.trim(),
      reviewDate: reviewDate ? new Date(reviewDate) : Date.now(),
      country: country || "",
      createdSource: "admin",
    });

    await recalculateServiceRating(service._id);

    return res.status(201).json({
      message: "Admin review created successfully",
      review,
    });
  } catch (error) {
    console.error("adminCreateReview error:", error);
    return next(createError(500, "Server error while creating admin review"));
  }
};

// PUBLIC SERVICE REVIEWS
// export const getReviewsByService = async (req, res, next) => {
//   try {
//     const { serviceId } = req.params;
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.max(Number(req.query.limit) || 5, 1);
//     const skip = (page - 1) * limit;

//     if (!serviceId) {
//       return next(createError(400, "Service id is required"));
//     }

//     if (!mongoose.Types.ObjectId.isValid(serviceId)) {
//       return next(createError(400, "Invalid service id"));
//     }

//     const service = await Service.findById(serviceId).select(
//       "title category averageStars starNumber",
//     );

//     if (!service) {
//       return next(createError(404, "Service not found"));
//     }

//     const query = {
//       serviceId,
//       isVisible: true,
//     };

//     const totalReviews = await Review.countDocuments(query);

//     const reviews = await Review.find(query)
//       .populate("userId", "name img")
//       .sort({ reviewDate: -1, createdAt: -1, _id: -1 })
//       .skip(skip)
//       .limit(limit);

//     const formattedReviews = reviews.map(formatReview);

//     const hasMore = skip + formattedReviews.length < totalReviews;

//     return res.status(200).json({
//       reviews: formattedReviews,
//       pagination: {
//         page,
//         limit,
//         totalReviews,
//         totalPages: Math.ceil(totalReviews / limit),
//         hasMore,
//       },
//       hasMore,
//     });
//   } catch (error) {
//     console.error("getReviewsByService error:", error);
//     return next(createError(500, "Server error while fetching reviews"));
//   }
// };
export const getReviewsByService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 5, 1);
    const skip = (page - 1) * limit;

    if (!serviceId) return next(createError(400, "Service id is required"));
    if (!mongoose.Types.ObjectId.isValid(serviceId))
      return next(createError(400, "Invalid service id"));

    const query = {
      serviceId: new mongoose.Types.ObjectId(serviceId),
      isVisible: true,
    };

    // ১. টোটাল রিভিউ কাউন্ট
    const totalReviews = await Review.countDocuments(query);

    // ২. এগ্রিগেশন পাইপলাইন (সর্টিং লজিক সহ)
    const reviews = await Review.aggregate([
      { $match: query },
      {
        $addFields: {
          // লজিক: যদি reviewDate থাকে তবে সেটি নাও, নাহলে createdAt নাও
          finalSortDate: { $ifNull: ["$reviewDate", "$createdAt"] },
        },
      },
      {
        $sort: {
          finalSortDate: -1, // বড় তারিখ আগে (Latest First)
          _id: -1, // তারিখ সেম হলে লেটেস্ট আইডি আগে
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users", // আপনার ইউজার কালেকশনের নাম যদি 'users' হয়
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
    ]);

    // আপনার কাস্টম ফরম্যাটার কল করা
    const formattedReviews = reviews.map(formatReview);

    const hasMore = skip + formattedReviews.length < totalReviews;

    return res.status(200).json({
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
        hasMore,
      },
      hasMore,
    });
  } catch (error) {
    console.error("getReviewsByService error:", error);
    return next(createError(500, "Server error while fetching reviews"));
  }
};
// ADMIN GET REVIEWS BY SERVICE
export const adminGetReviewsByService = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can access service reviews"));
    }

    const { serviceId } = req.params;

    if (!serviceId) {
      return next(createError(400, "Service id is required"));
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return next(createError(400, "Invalid service id"));
    }

    const service = await Service.findById(serviceId).select(
      "title category averageStars starNumber",
    );

    if (!service) {
      return next(createError(404, "Service not found"));
    }

    const reviews = await Review.find({ serviceId })
      .populate("userId", "name img")
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map(formatReview);
    const visibleCount = formattedReviews.filter((r) => r.isVisible).length;
    const hiddenCount = formattedReviews.filter((r) => !r.isVisible).length;

    return res.status(200).json({
      service: {
        _id: service._id,
        title: service.title || "",
        category: service.category || "",
        averageStars: service.averageStars || 0,
        totalReviews: service.starNumber || 0,
      },
      counts: {
        total: formattedReviews.length,
        visible: visibleCount,
        hidden: hiddenCount,
      },
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("adminGetReviewsByService error:", error);
    return next(
      createError(500, "Server error while fetching service reviews"),
    );
  }
};

// ADMIN GET SINGLE REVIEW
export const adminGetSingleReviewById = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can access review details"));
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Invalid review id"));
    }

    const review = await Review.findById(id)
      .populate("userId", "name img")
      .populate("serviceId", "title category");

    if (!review) {
      return next(createError(404, "Review not found"));
    }

    const formattedReview = formatReview(review);

    return res.status(200).json({
      service: review.serviceId
        ? {
            _id: review.serviceId._id,
            title: review.serviceId.title || "",
            category: review.serviceId.category || "",
          }
        : null,
      review: formattedReview,
    });
  } catch (error) {
    console.error("adminGetSingleReviewById error:", error);
    return next(createError(500, "Server error while fetching review details"));
  }
};

// ADMIN GET ALL REVIEWS
export const adminGetAllReviews = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can access all reviews"));
    }

    const reviews = await Review.find()
      .populate("userId", "name img")
      .populate("serviceId", "title category")
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map((review) => {
      const formatted = formatReview(review);

      return {
        ...formatted,
        serviceTitle: review.serviceId?.title || "",
        serviceCategory: review.serviceId?.category || "",
      };
    });

    return res.status(200).json(formattedReviews);
  } catch (error) {
    console.error("adminGetAllReviews error:", error);
    return next(createError(500, "Server error while fetching all reviews"));
  }
};

// ADMIN UPDATE REVIEW
export const adminUpdateReview = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can update reviews"));
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(createError(404, "Review not found"));
    }

    const updateData = {};

    if (req.body.name !== undefined) {
      updateData.name = req.body.name.trim();
    }

    if (req.body.desc !== undefined) {
      updateData.desc = req.body.desc.trim();
    }
    if (req.body.reviewDate !== undefined) {
      updateData.reviewDate = req.body.reviewDate
        ? new Date(req.body.reviewDate)
        : review.reviewDate;
    }

    if (req.body.country !== undefined) {
      updateData.country = req.body.country.trim();
    }
    if (req.body.star !== undefined) {
      const numericStar = Number(req.body.star);

      if (Number.isNaN(numericStar) || numericStar < 1 || numericStar > 5) {
        return next(createError(400, "Star must be between 1 and 5"));
      }

      updateData.star = numericStar;
    }

    if (req.body.isVisible !== undefined) {
      if (req.body.isVisible === "true" || req.body.isVisible === true) {
        updateData.isVisible = true;
      } else if (
        req.body.isVisible === "false" ||
        req.body.isVisible === false
      ) {
        updateData.isVisible = false;
      }
    }

    updateData.userImage = review.userImage || {
      url: "",
      public_id: "",
    };

    if (req.files?.image) {
      if (review.userImage?.public_id) {
        await deleteFromS3(review.userImage.public_id);
      }

      const uploaded = await uploadToS3(req.files.image, "reviews/images");

      updateData.userImage = {
        url: uploaded.url,
        public_id: uploaded.key,
      };
    }

    updateData.isAdminEdited = true;
    updateData.editedByAdminId = req.userId;
    updateData.adminEditedAt = new Date();

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    )
      .populate("userId", "name img")
      .populate("serviceId", "title category");

    await recalculateServiceRating(review.serviceId);

    return res.status(200).json({
      message: "Review updated successfully",
      service: updatedReview.serviceId
        ? {
            _id: updatedReview.serviceId._id,
            title: updatedReview.serviceId.title || "",
            category: updatedReview.serviceId.category || "",
          }
        : null,
      review: formatReview(updatedReview),
    });
  } catch (error) {
    console.error("adminUpdateReview error:", error);
    return next(createError(500, "Server error while updating review"));
  }
};

// ADMIN DELETE REVIEW
export const adminDeleteReview = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can delete reviews"));
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(createError(404, "Review not found"));
    }

    if (review.userImage?.public_id) {
      await deleteFromS3(review.userImage.public_id);
    }

    const serviceId = review.serviceId;

    await review.deleteOne();

    await recalculateServiceRating(serviceId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("adminDeleteReview error:", error);
    return next(createError(500, "Server error while deleting review"));
  }
};
