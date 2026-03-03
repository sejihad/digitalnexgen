// controllers/notifyController.js
import uploadToS3 from "../config/uploadToS3.js";
import UserNotify from "../models/userNotifyModel.js";
import { sendNotify } from "../services/notifyService.js";
import createError from "../utils/createError.js";

// ✅ Get notifications (paginated)
export const getNotifies = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const notifications = await UserNotify.find({ user: userId })
      .populate("notify", "title message image link createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      page,
      limit,
      hasMore: notifications.length === limit,
      notifications: notifications
        .filter((n) => n.notify)
        .map((n) => ({
          _id: n._id,
          isRead: n.isRead,
          createdAt: n.createdAt,
          notify: n.notify,
        })),
    });
  } catch (error) {
    next(createError(500, "Server error while fetching notifications"));
  }
};

// ✅ Admin send notification
export const adminSendNotification = async (req, res, next) => {
  try {
    const { title, message, users, link } = req.body;

    if (!title || !message) {
      return next(createError(400, "Title and message are required"));
    }

    let userIds = [];

    if (users) {
      if (Array.isArray(users)) {
        userIds = users;
      } else {
        // string → array
        try {
          userIds = JSON.parse(users);
          if (!Array.isArray(userIds)) userIds = [];
        } catch (e) {
          return next(createError(400, "Invalid users format"));
        }
      }
    }

    // Handle image upload (if provided)
    let imageLink = null;

    if (req.files && req.files.image) {
      const file = req.files.image;

      try {
        const uploaded = await uploadToS3(file, "product/notifies");
        imageLink = {
          public_id: uploaded.key,
          url: uploaded.url,
        };
      } catch (error) {
        return next(createError(500, "Image upload failed"));
      }
    }

    await sendNotify({
      title,
      message,
      users: userIds,
      image: imageLink,
      link: link || null,
    });

    res.status(200).json({
      success: true,
      message: userIds.length
        ? "Notification sent to selected users"
        : "Notification sent to all users",
      hasImage: !!imageLink,
    });
  } catch (error) {
    next(createError(500, "Server error while sending notification"));
  }
};

// ✅ Mark notification as read
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await UserNotify.findOne({
      _id: id,
      user: userId,
    });

    if (!notification) {
      return next(createError(404, "Notification not found"));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      notificationId: id,
    });
  } catch (error) {
    next(createError(500, "Server error while marking notification as read"));
  }
};

// ✅ Delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await UserNotify.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!notification) {
      return next(createError(404, "Notification not found"));
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      notificationId: id,
    });
  } catch (error) {
    next(createError(500, "Server error while deleting notification"));
  }
};

// ✅ Get notification by ID (and mark as read)
export const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await UserNotify.findOne({
      _id: id,
      user: userId,
    }).populate("notify", "title message image link createdAt");

    if (!notification) {
      return next(createError(404, "Notification not found"));
    }

    // Mark as read when viewing details
    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(createError(500, "Server error while fetching notification"));
  }
};
