import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { subject, message, recipients, individualMode, attachments } =
      req.body;

    if (!subject || !message || !recipients) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ✅ Normalize recipients
    const recipientList = Array.isArray(recipients)
      ? recipients
      : JSON.parse(recipients);

    // ✅ Normalize attachments
    const attachmentList = attachments
      ? Array.isArray(attachments)
        ? attachments
        : JSON.parse(attachments)
      : [];

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailAttachments = attachmentList.map((file) => ({
      filename: file.name,
      content: Buffer.from(file.data, "base64"),
    }));

    let results = [];

    // 📨 Individual mode (single user)
    if (individualMode) {
      const recipient = recipientList[0];

      try {
        const result = await transporter.sendMail({
          from: `"Digital NexGen" <${process.env.SMTP_MAIL}>`,

          to: recipient,
          subject,
          text: message,
          attachments: mailAttachments,
        });

        results.push({
          email: recipient,
          status: "sent",
          messageId: result.messageId,
        });
      } catch (error) {
        results.push({
          email: recipient,
          status: "failed",
          error: error.message,
        });
      }
    } else {
      // 📨 Bulk mode (each user gets individual email)
      for (const recipient of recipientList) {
        try {
          const result = await transporter.sendMail({
            from: process.env.SMTP_MAIL,
            to: recipient,
            subject,
            text: message,
            attachments: mailAttachments,
          });

          results.push({
            email: recipient,
            status: "sent",
            messageId: result.messageId,
          });
        } catch (error) {
          results.push({
            email: recipient,
            status: "failed",
            error: error.message,
          });
        }

        // ⏱ Small delay (rate-limit protection)
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const failedEmails = results.filter((r) => r.status === "failed");

    if (failedEmails.length > 0) {
      return res.status(207).json({
        success: true,
        message: `Emails sent with ${failedEmails.length} failures`,
        results,
      });
    }

    res.status(200).json({
      success: true,
      message: `All ${results.length} emails sent successfully`,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Email sending failed",
    });
  }
};
export const sendMessage = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim();
    const subject =
      String(req.body?.subject || "").trim() || "Contact Form Message";
    const message = String(req.body?.message || "").trim();

    // ✅ basic validation
    if (!name || !email || !message) {
      return res.status(400).json("Name, email, and message are required");
    }

    // ✅ simple email format check
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      return res.status(400).json("Please provide a valid email address");
    }

    // ✅ where you want to receive contact messages
    const toEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_MAIL;
    if (!toEmail) {
      return res.status(500).json("Server email receiver is not configured");
    }

    const port = Number(process.env.SMTP_PORT || 587);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 true, 587 false
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // ✅ optional: verify SMTP (helps debug)
    // await transporter.verify();

    const textBody =
      `New contact message:\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Subject: ${subject}\n\n` +
      `Message:\n${message}\n`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Subject:</b> ${escapeHtml(subject)}</p>
        <hr />
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Digital NexGen" <${process.env.SMTP_MAIL}>`,
      to: toEmail,
      subject: `[Contact] ${subject}`,
      text: textBody,
      html: htmlBody,
      replyTo: email, // ✅ reply goes to user
    });

    return res.status(200).json("Message sent successfully.");
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json(error?.message || "Failed to send message");
  }
};

// ✅ small helper to prevent HTML injection in email body
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
