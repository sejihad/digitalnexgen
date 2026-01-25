import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/user.model.js";

export const initializePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value?.toLowerCase() || null;
          const name = profile.displayName || "Google User";
          let avatar = profile.photos?.[0]?.value || null;

          if (avatar && avatar.includes("=s")) {
            avatar = avatar.replace(/=s\d+-c/, "=s400-c");
          }

          // 🔍 1. Check by googleId first
          let user = await User.findOne({ googleId });

          // 🔍 2. If not found, check by email (account linking)
          if (!user && email) {
            user = await User.findOne({ email });
          }

          if (!user) {
            // 🧠 Generate username
            let base = name
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9._-]/g, "");

            let username = base.slice(0, 24);
            let counter = 0;

            while (
              await User.exists({
                username,
                provider: "google",
              })
            ) {
              counter++;
              username = `${base.slice(0, 20)}${counter}`;
            }

            user = await User.create({
              username,
              name,
              email,
              img: { url: avatar, public_id: null },
              googleId,
              provider: "google",
              isTwoFactorEnabled: false,
            });

            user.isNewUser = true;
          } else {
            // 🔗 Link Google account if missing
            if (!user.googleId) {
              user.googleId = googleId;
              user.provider = "google";
              await user.save();
            }

            user.isNewUser = false;
          }

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      },
    ),
  );
};
