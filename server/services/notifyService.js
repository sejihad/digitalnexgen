import Notify from "../models/notifyModel";

import admin from "../config/firebase.js";
import User from "../models/user.model.js";
import UserNotify from "../models/userNotifyModel.js";
import { getIO, onlineUsers } from "../utils/socket.js";

const BATCH_SIZE = 500;

const sendNotify = async ({ title, message, users = [], image, link }) => {
  try {
    const notifyData = { title, message };
    if (image) notifyData.image = image;
    if (link) notifyData.link = link;

    // 1️⃣ Create notification content only ONCE
    const notify = await Notify.create(notifyData);
    const io = getIO();

    // 2️⃣ Decide recipients
    let userIds;
    if (users.length > 0) {
      // frontend sends specific user IDs
      userIds = users;
    } else {
      // broadcast → all users
      const allUsers = await User.find({}, "_id");
      userIds = allUsers.map((u) => u._id);
    }

    // 3️⃣ Batch insert user-notify mapping
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE);

      const mappings = batch.map((userId) => ({
        user: userId,
        notify: notify._id,
      }));

      // insertMany returns inserted docs
      const inserted = await UserNotify.insertMany(mappings, {
        ordered: false,
      });
      // ✅ FCM push (batch-wise)
      const usersWithTokens = await User.find(
        { _id: { $in: batch } },
        "fcmTokens",
      ).lean();

      const tokens = [
        ...new Set(
          usersWithTokens.flatMap((u) => u.fcmTokens || []).filter(Boolean),
        ),
      ];

      try {
        if (tokens.length) {
          const dataPayload = {};
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
      } catch (e) {}

      // 4️⃣ Emit real-time notification via Socket.IO
      inserted.forEach((userNotify) => {
        const socketIdOrArray = onlineUsers.get(userNotify.user.toString());

        // Handle multi-device (array of socketIds)
        const socketIds = Array.isArray(socketIdOrArray)
          ? socketIdOrArray
          : socketIdOrArray
            ? [socketIdOrArray]
            : [];

        socketIds.forEach((socketId) => {
          io.to(socketId).emit("newNotification", {
            _id: userNotify._id, // ✅ UserNotify ID
            isRead: userNotify.isRead,
            createdAt: userNotify.createdAt,
            notify: {
              _id: notify._id, // ✅ Notify content ID
              title: notify.title,
              message: notify.message,
              image: notify.image,
              link: notify.link,
              createdAt: notify.createdAt,
            },
          });
        });
      });
    }

    return notify;
  } catch (err) {
    throw err;
  }
};

module.exports = { sendNotify };
