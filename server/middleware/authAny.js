import jwt from "jsonwebtoken";
import { getFirebaseAdmin } from "../utils/firebaseAdmin.js";

export const verifyAnyAuth = async (req, res, next) => {
  // 1) Try our JWT cookie
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) {
    try {
      const payload = jwt.verify(cookieToken, process.env.JWT_KEY);
      req.userId = payload.id;
      req.isAdmin = payload.isAdmin;
      return next();
    } catch (e) {
      // fallthrough to Firebase
    }
  }

  // 2) Try Firebase ID token from Authorization: Bearer <token>
  try {
    const authz = req.headers["authorization"] || req.headers["Authorization"];
    if (!authz || !authz.startsWith("Bearer ")) {
      return res.status(401).send("You are not authenticated");
    }
    const idToken = authz.slice("Bearer ".length).trim();
    const admin = getFirebaseAdmin();
    if (!admin) return res.status(503).send("Firebase not configured on server");
    const decoded = await admin.auth().verifyIdToken(idToken);
    // Optionally map Firebase uid/email to our user later if needed
    req.firebaseUid = decoded.uid;
    req.userEmail = decoded.email;
    return next();
  } catch (err) {
    return res.status(403).send("Token isn't valid");
  }
};
