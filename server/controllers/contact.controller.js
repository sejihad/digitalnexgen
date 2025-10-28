import nodemailer from "nodemailer";
import createError from "../utils/createError.js";
import ContactMessage from "../models/contactMessage.model.js";

export const sendContactMessage = async (req, res, next) => {
  try {
    const { name = "", email = "", subject = "", message = "" } = req.body || {};
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

    const hasSmtpCreds = Boolean(process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD);
    let transporter = null;
    let mailOptions = null;
    if (hasSmtpCreds) {
      transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const toAddress = process.env.CONTACT_RECEIVER || process.env.EMAIL_USERNAME;

      mailOptions = {
        from: `Contact Form <${process.env.EMAIL_USERNAME}>`,
        replyTo: `${trimmedName} <${trimmedEmail}>`,
        to: toAddress,
        subject: `[Contact] ${trimmedSubject}`,
        text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}`,
      };
    }

    // Persist message for admin view/action
    try {
      await ContactMessage.create({
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
        status: "new",
      });
    } catch (dbErr) {
      // Do not fail user flow if email sending will proceed; but log
      // eslint-disable-next-line no-console
      console.error("Failed saving contact message:", dbErr?.message || dbErr);
    }

    // Send email only if SMTP creds are configured
    if (hasSmtpCreds && transporter && mailOptions) {
      try {
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        // Log but do not fail the request
        // eslint-disable-next-line no-console
        console.error("Failed to send contact email:", mailErr?.message || mailErr);
      }
    }

    res.status(200).json({ success: true, message: "Your message has been sent." });
  } catch (err) {
    next(err);
  }
};

// Admin: list messages with optional status filter and pagination
export const adminListContacts = async (req, res, next) => {
  try {
    if (!req.isAdmin) return next(createError(403, "Forbidden"));
    const { status, page = 1, limit = 20 } = req.query || {};
    const q = {};
    if (status) q.status = status;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 20, 1);
    const skip = (pageNum - 1) * limitNum;
    const [items, total] = await Promise.all([
      ContactMessage.find(q).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      ContactMessage.countDocuments(q),
    ]);
    res.json({ items, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

// Admin: get single message
export const adminGetContact = async (req, res, next) => {
  try {
    if (!req.isAdmin) return next(createError(403, "Forbidden"));
    const { id } = req.params;
    const doc = await ContactMessage.findById(id);
    if (!doc) return next(createError(404, "Not found"));
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// Admin: update status
export const adminUpdateStatus = async (req, res, next) => {
  try {
    if (!req.isAdmin) return next(createError(403, "Forbidden"));
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ["new", "in_progress", "resolved", "archived"];
    if (!allowed.includes(status)) return next(createError(400, "Invalid status"));
    const updated = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return next(createError(404, "Not found"));
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Admin: delete message
export const adminDeleteContact = async (req, res, next) => {
  try {
    if (!req.isAdmin) return next(createError(403, "Forbidden"));
    const { id } = req.params;
    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) return next(createError(404, "Not found"));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
