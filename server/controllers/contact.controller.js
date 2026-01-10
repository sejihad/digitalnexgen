import createError from "../utils/createError.js";
import sendEmail from "../utils/sendEmail.js";

export const sendContactMessage = async (req, res, next) => {
  try {
    const {
      name = "",
      email = "",
      subject = "",
      message = "",
    } = req.body || {};
    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim();
    const trimmedSubject = String(subject).trim() || "New Contact Message";
    const trimmedMessage = String(message).trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return next(createError(400, "Name, email, and message are required"));
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(trimmedEmail)) {
      return next(createError(400, "Invalid email format"));
    }

    await sendEmail({
      email: process.env.SMTP_MAIL, // your admin email
      subject: trimmedSubject,
      message: trimmedMessage,
    });

    res
      .status(200)
      .json({ success: true, message: "Your message has been sent." });
  } catch (err) {
    next(err);
  }
};
