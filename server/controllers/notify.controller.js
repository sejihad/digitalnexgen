import uploadToS3 from "../config/uploadToS3.js";
import User from "../models/user.model.js";
import UserNotify from "../models/userNotify.model.js";
import { sendNotify } from "../services/notify.service.js";
import createError from "../utils/createError.js";
export const getNotifies = async (req, res, next) => {
  try {
    const userId = req.userId;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const notifications = await UserNotify.find({ user: userId })
      .populate("notify", "title message type image link createdAt")
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

export const adminSendNotification = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return next(createError(403, "Only admin can send notifications"));
    }

    const { title, message, users, link, type } = req.body;

    if (!title || !message) {
      return next(createError(400, "Title and message are required"));
    }

    let userIds = [];

    if (users) {
      if (Array.isArray(users)) {
        userIds = users;
      } else {
        try {
          userIds = JSON.parse(users);
          if (!Array.isArray(userIds)) userIds = [];
        } catch (e) {
          return next(createError(400, "Invalid users format"));
        }
      }
    }

    let imageLink = null;

    if (req.files?.image) {
      try {
        const uploaded = await uploadToS3(
          req.files.image,
          "notifications/images",
        );
        imageLink = {
          public_id: uploaded.key,
          url: uploaded.url,
        };
      } catch (error) {
        console.error("S3 upload error:", error);
        return next(createError(500, "Image upload failed"));
      }
    }

    await sendNotify({
      title,
      message,
      users: userIds,
      image: imageLink,
      link: link || null,
      type: type || "system",
    });

    res.status(200).json({
      success: true,
      message: userIds.length
        ? "Notification sent to selected users"
        : "Notification sent to all users",
      hasImage: !!imageLink,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await UserNotify.findOne({
      _id: id,
      user: userId,
    }).populate("notify", "type");

    if (!notification) {
      return next(createError(404, "Notification not found"));
    }

    const type = notification?.notify?.type;
    const shortLivedTypes = ["message", "offer", "review-request"];

    // ✅ admin read করলে same notify সব admin-এর জন্য read
    if (req.isAdmin) {
      const admins = await User.find({ isAdmin: true }, "_id").lean();
      const adminIds = admins.map((a) => a._id);

      const updateData = {
        isRead: true,
      };

      if (shortLivedTypes.includes(type)) {
        updateData.autoDeleteAt = new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        );
      }

      await UserNotify.updateMany(
        {
          notify: notification.notify._id,
          user: { $in: adminIds },
        },
        { $set: updateData },
      );
    } else {
      // ✅ normal user read
      notification.isRead = true;

      if (shortLivedTypes.includes(type)) {
        notification.autoDeleteAt = new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        );
      }

      await notification.save();
    }

    res.status(200).json({
      success: true,
      notificationId: id,
    });
  } catch (error) {
    next(createError(500, "Server error while marking notification as read"));
  }
};
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.userId;

    const myNotifications = await UserNotify.find({
      user: userId,
      isRead: false,
    }).populate("notify", "type");

    if (!myNotifications.length) {
      return res.status(200).json({
        success: true,
        message: "No unread notifications found",
      });
    }

    const shortLivedTypes = ["message", "offer", "review-request"];
    const autoDeleteAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    if (req.isAdmin) {
      const admins = await User.find({ isAdmin: true }, "_id").lean();
      const adminIds = admins.map((a) => String(a._id));

      const notifyIds = [
        ...new Set(
          myNotifications
            .map((n) => String(n.notify?._id || ""))
            .filter(Boolean),
        ),
      ];

      const adminMappings = await UserNotify.find({
        notify: { $in: notifyIds },
        user: { $in: adminIds },
        isRead: false,
      }).populate("notify", "type");

      for (const item of adminMappings) {
        item.isRead = true;

        if (shortLivedTypes.includes(item?.notify?.type)) {
          item.autoDeleteAt = autoDeleteAt;
        }

        await item.save();
      }

      return res.status(200).json({
        success: true,
        message: "All admin notifications marked as read",
      });
    }

    for (const item of myNotifications) {
      item.isRead = true;

      if (shortLivedTypes.includes(item?.notify?.type)) {
        item.autoDeleteAt = autoDeleteAt;
      }

      await item.save();
    }

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(
      createError(500, "Server error while marking all notifications as read"),
    );
  }
};
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

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

export const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await UserNotify.findOne({
      _id: id,
      user: userId,
    }).populate("notify", "title message type image link createdAt");

    if (!notification) {
      return next(createError(404, "Notification not found"));
    }

    if (!notification.isRead) {
      notification.isRead = true;

      const type = notification?.notify?.type;
      const shortLivedTypes = ["message", "offer", "review-request"];

      if (shortLivedTypes.includes(type)) {
        notification.autoDeleteAt = new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        );
      }

      await notification.save();
    }
    res.status(200).json({
      success: true,
      notification: {
        _id: notification._id,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        notify: notification.notify,
      },
    });
  } catch (error) {
    next(createError(500, "Server error while fetching notification"));
  }
};
