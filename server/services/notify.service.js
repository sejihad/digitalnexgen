import admin from "../config/firebase.js";
import Notify from "../models/notify.model.js";
import User from "../models/user.model.js";
import UserNotify from "../models/userNotify.model.js";
import { getIO } from "../socketInstance.js";
import createError from "../utils/createError.js";

const BATCH_SIZE = 500;

export const sendNotify = async ({
  title,
  message,
  users = [],
  image = null,
  link = null,
  type = "system",
  adminsOnly = false,
}) => {
  try {
    if (!title || !message) {
      throw createError(400, "Title and message are required");
    }

    const notifyData = {
      title: String(title).trim(),
      message: String(message).trim(),
      type,
      link: link || null,
    };

    if (image) {
      notifyData.image = {
        public_id: image.public_id || "",
        url: image.url || "",
      };
    }

    const notify = await Notify.create(notifyData);
    const io = getIO();

    let userIds = [];

    if (Array.isArray(users) && users.length > 0) {
      userIds = [...new Set(users.map((id) => String(id)).filter(Boolean))];
    } else if (adminsOnly) {
      const admins = await User.find({ isAdmin: true }, "_id").lean();
      userIds = admins.map((u) => String(u._id));
    } else {
      const allUsers = await User.find({}, "_id").lean();
      userIds = allUsers.map((u) => String(u._id));
    }
    if (!userIds.length) {
      return null;
    }
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE);

      const mappings = batch.map((userId) => ({
        user: userId,
        notify: notify._id,
      }));

      const inserted = await UserNotify.insertMany(mappings, {
        ordered: false,
      });

      // realtime emit
      if (io) {
        inserted.forEach((userNotify) => {
          io.to(`user:${String(userNotify.user)}`).emit("notification:new", {
            _id: userNotify._id,
            isRead: userNotify.isRead,
            createdAt: userNotify.createdAt,
            notify: {
              _id: notify._id,
              title: notify.title,
              message: notify.message,
              type: notify.type,
              image: notify.image,
              link: notify.link,
              createdAt: notify.createdAt,
            },
          });
        });
      }

      // optional FCM push
      try {
        const usersWithTokens = await User.find(
          { _id: { $in: batch } },
          "fcmTokens",
        ).lean();

        const tokens = [
          ...new Set(
            usersWithTokens.flatMap((u) => u.fcmTokens || []).filter(Boolean),
          ),
        ];

        if (tokens.length) {
          const dataPayload = {
            type: String(type || "system"),
          };

          if (link) dataPayload.link = String(link);
          if (notify?._id) dataPayload.notifyId = String(notify._id);

          for (let t = 0; t < tokens.length; t += 500) {
            const tokenChunk = tokens.slice(t, t + 500);

            const resp = await admin.messaging().sendEachForMulticast({
              tokens: tokenChunk,
              notification: {
                title: String(title),
                body: String(message),
              },
              data: dataPayload,
            });

            const badTokens = [];

            resp.responses.forEach((r, idx) => {
              if (!r.success) {
                const code = r.error?.code || "";
                if (
                  code.includes("registration-token-not-registered") ||
                  code.includes("invalid-registration-token") ||
                  code.includes("invalid-argument")
                ) {
                  badTokens.push(tokenChunk[idx]);
                }
              }
            });

            if (badTokens.length) {
              await User.updateMany(
                { fcmTokens: { $in: badTokens } },
                { $pull: { fcmTokens: { $in: badTokens } } },
              );
            }
          }
        }
      } catch (fcmError) {
        console.error("FCM send error:", fcmError?.message || fcmError);
      }
    }

    return notify;
  } catch (error) {
    if (error?.status) throw error;
    throw createError(500, error.message || "Failed to send notification");
  }
};
