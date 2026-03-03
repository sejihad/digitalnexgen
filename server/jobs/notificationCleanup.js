import cron from "node-cron";
import deleteFromS3 from "../config/deleteFromS3.js";
import Notify from "../models/notifyModel.js";
import UserNotify from "../models/userNotifyModel.js";
cron.schedule(
  "0 3 * * *",
  async () => {
    try {
      const expired = await Notify.find(
        { expiresAt: { $lte: new Date() } },
        "_id image",
      );

      if (!expired.length) return;
      for (const notify of expired) {
        if (notify.image?.public_id) {
          try {
            await deleteFromS3(notify.image.public_id);
          } catch (err) {}
        }
      }
      const ids = expired.map((n) => n._id);

      await Notify.deleteMany({ _id: { $in: ids } });
      await UserNotify.deleteMany({ notify: { $in: ids } });
    } catch (e) {}
  },
  { timezone: "Asia/Dhaka" },
);
