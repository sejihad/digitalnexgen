import cron from "node-cron";
import deleteFromS3 from "../config/deleteFromS3.js";
import Notify from "../models/notify.model.js";
import UserNotify from "../models/userNotify.model.js";

cron.schedule(
  "0 3 * * *",
  async () => {
    try {
      const now = new Date();

      // 1) delete user-specific notifications that passed autoDeleteAt
      await UserNotify.deleteMany({
        autoDeleteAt: { $ne: null, $lte: now },
      });

      // 2) find globally expired notifications
      const expiredNotifies = await Notify.find(
        { expiresAt: { $lte: now } },
        "_id image",
      ).lean();

      if (expiredNotifies.length > 0) {
        const expiredIds = expiredNotifies.map((n) => n._id);

        for (const notify of expiredNotifies) {
          if (notify.image?.public_id) {
            try {
              await deleteFromS3(notify.image.public_id);
            } catch (err) {
              console.error(
                "Failed to delete notify image from S3:",
                err?.message || err,
              );
            }
          }
        }

        await UserNotify.deleteMany({
          notify: { $in: expiredIds },
        });

        await Notify.deleteMany({
          _id: { $in: expiredIds },
        });
      }

      // 3) delete orphaned notifications (no user mappings left)
      const orphanedNotifies = await Notify.aggregate([
        {
          $lookup: {
            from: "usernotifies",
            localField: "_id",
            foreignField: "notify",
            as: "userMappings",
          },
        },
        {
          $match: {
            userMappings: { $size: 0 },
          },
        },
        {
          $project: {
            _id: 1,
            image: 1,
          },
        },
      ]);

      if (orphanedNotifies.length > 0) {
        const orphanIds = orphanedNotifies.map((n) => n._id);

        for (const notify of orphanedNotifies) {
          if (notify.image?.public_id) {
            try {
              await deleteFromS3(notify.image.public_id);
            } catch (err) {
              console.error(
                "Failed to delete orphan notify image from S3:",
                err?.message || err,
              );
            }
          }
        }

        await Notify.deleteMany({
          _id: { $in: orphanIds },
        });
      }
    } catch (error) {
      console.error(
        "Notification cleanup cron error:",
        error?.message || error,
      );
    }
  },
  { timezone: "Europe/London" },
);
