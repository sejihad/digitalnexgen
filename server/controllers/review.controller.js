import createError from "../utils/createError.js";
import Review from "../models/review.model.js";
import Service from "../models/service.model.js";

export const createReview = async (req, res, next) => {
  if (req.isAdmin) {
    return next(createError(403, "Admin can't create reviews!"));
  }

  const newReview = new Review({
    serviceId: req.body.serviceId,
    userId: req.userId,
    username: req.body.username,
    userImage: req.body.userImage,
    country: req.body.country,
    star: parseInt(req.body.star, 10),
    desc: req.body.desc,
  });

  try {
    const savedReview = await newReview.save();
    // Do NOT update aggregates until approved
    const service = await Service.findById(req.body.serviceId);
    if (!service) {
      return next(createError(404, "Service not found!"));
    }
    res.status(201).send(savedReview);
  } catch (error) {
    next(createError(500, "Internal server error!"));
  }
};

export const getReviews = async (req, res, next) => {
  try {
    // Public reviews: only approved
    const reviews = await Review.find({ serviceId: req.params.serviceId, approved: true });
    res.status(200).send(reviews);
  } catch (error) {
    next(createError(500, "Internal Server Error!"));
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(createError(404, "Review not found!"));
    }

    if (!req.isAdmin && review.userId !== req.userId) {
      return next(createError(403, "You can only delete your own reviews!"));
    }

    // Only adjust aggregates if the review was approved
    const service = await Service.findById(review.serviceId);
    if (!service) {
      return next(createError(404, "Service not found!"));
    }
    if (review.approved) {
      service.totalStars -= review.star;
      service.starNumber -= 1;
      service.averageStars =
        service.starNumber > 0
          ? parseFloat((service.totalStars / service.starNumber).toFixed(1))
          : 0;
      await service.save();
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).send({ message: "Review deleted successfully!" });
  } catch (error) {
    next(createError(500, "Internal server error!"));
  }
};

// Update review (owner or admin). If approved, adjust star aggregates when star changes
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { star, desc } = req.body;

    const review = await Review.findById(id);
    if (!review) return next(createError(404, "Review not found!"));
    if (!req.isAdmin && review.userId !== req.userId) {
      return next(createError(403, "You can only edit your own reviews!"));
    }

    const service = await Service.findById(review.serviceId);
    if (!service) return next(createError(404, "Service not found!"));

    let updatedStar = parseInt(star, 10);
    if (!Number.isNaN(updatedStar) && [1,2,3,4,5].includes(updatedStar) && updatedStar !== review.star) {
      if (review.approved) {
        service.totalStars = service.totalStars - review.star + updatedStar;
        service.averageStars = service.starNumber > 0
          ? parseFloat((service.totalStars / service.starNumber).toFixed(1))
          : 0;
        await service.save();
      }
      review.star = updatedStar;
    }
    if (typeof desc === 'string' && desc.trim()) {
      review.desc = desc.trim();
    }
    await review.save();
    res.status(200).json(review);
  } catch (error) {
    next(createError(500, "Internal server error!"));
  }
};

// Admin: list reviews by status
export const adminListReviews = async (req, res, next) => {
  try {
    if (!req.isAdmin) return next(createError(403, "Only admin can view this list"));
    const { status } = req.query; // 'pending' | 'approved' | undefined
    const filter = {};
    if (status === 'pending') filter.approved = false;
    if (status === 'approved') filter.approved = true;
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    next(createError(500, "Internal server error!"));
  }
};

// Admin: approve a review (transition from pending->approved and update aggregates)
export const approveReview = async (req, res, next) => {
  try {
    if (!req.isAdmin) return next(createError(403, "Only admin can approve reviews"));
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return next(createError(404, "Review not found!"));
    if (review.approved) return res.status(200).json(review);

    const service = await Service.findById(review.serviceId);
    if (!service) return next(createError(404, "Service not found!"));

    service.totalStars += review.star;
    service.starNumber += 1;
    service.averageStars = service.starNumber > 0
      ? parseFloat((service.totalStars / service.starNumber).toFixed(1))
      : 0;
    await service.save();

    review.approved = true;
    await review.save();
    res.status(200).json(review);
  } catch (error) {
    next(createError(500, "Internal server error!"));
  }
};

// Admin: reject (or unapprove) a review (transition approved->pending and remove from aggregates)
export const rejectReview = async (req, res, next) => {
  try {
    if (!req.isAdmin) return next(createError(403, "Only admin can reject reviews"));
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return next(createError(404, "Review not found!"));
    if (!review.approved) return res.status(200).json(review);

    const service = await Service.findById(review.serviceId);
    if (!service) return next(createError(404, "Service not found!"));

    service.totalStars -= review.star;
    service.starNumber -= 1;
    service.averageStars = service.starNumber > 0
      ? parseFloat((service.totalStars / service.starNumber).toFixed(1))
      : 0;
    await service.save();

    review.approved = false;
    await review.save();
    res.status(200).json(review);
  } catch (error) {
    next(createError(500, "Internal server error!"));
  }
};
