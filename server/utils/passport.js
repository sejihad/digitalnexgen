import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import passport from "passport";
import User from "../models/user.model.js";

export const connectPassport = () => {
  const hasGoogle =
    !!process.env.GOOGLE_CLIENT_ID &&
    !!process.env.GOOGLE_CLIENT_SECRET &&
    !!process.env.GOOGLE_CALLBACK_URI;

  if (hasGoogle) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URI,
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
              user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails?.[0]?.value,
                img: profile.photos?.[0]?.value,
                provider: "google",
              });
              await user.save();
            // attach token for downstream checks
            user._accessToken = accessToken;
            return done(null, user);
            }

            // Backfill photo if missing on existing user
            const photo = profile.photos?.[0]?.value;
            if (!user.img && photo) {
              user.img = photo;
              await user.save();
            }
            // attach token for downstream checks
            user._accessToken = accessToken;
            return done(null, user);
          } catch (err) {
            return done(err, false);
          }
        }
      )
    );
  } else {
    console.warn(
      "[passport] Skipping GoogleStrategy: GOOGLE_CLIENT_ID/SECRET/CALLBACK_URI not set"
    );
  }

  const hasFacebook =
    !!process.env.FACEBOOK_APP_ID &&
    !!process.env.FACEBOOK_APP_SECRET &&
    !!process.env.FACEBOOK_CALLBACK_URI;

  if (hasFacebook) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: process.env.FACEBOOK_CALLBACK_URI,
          profileFields: ["id", "displayName", "emails", "photos"],
          scope: ["email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ facebookId: profile.id });

            if (!user) {
              user = new User({
                facebookId: profile.id,
                username:
                  profile.displayName || profile.name?.givenName || "Anonymous",
                email: profile.emails?.[0]?.value || "no-email@facebook.com",
                img: profile.photos?.[0]?.value,
                provider: "facebook",
              });
              await user.save();
              return done(null, user);
            }
            // Backfill photo if missing on existing user
            const photo = profile.photos?.[0]?.value;
            if (!user.img && photo) {
              user.img = photo;
              await user.save();
            }
            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  } else {
    console.warn(
      "[passport] Skipping FacebookStrategy: FACEBOOK_APP_ID/SECRET/CALLBACK_URI not set"
    );
  }
};
