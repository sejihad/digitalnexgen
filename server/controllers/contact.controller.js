import sendEmail from "../utils/sendEmail.js";

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

    const recipientList = Array.isArray(recipients)
      ? recipients
      : JSON.parse(recipients);

    const attachmentList = attachments
      ? Array.isArray(attachments)
        ? attachments
        : JSON.parse(attachments)
      : [];

    const mailAttachments = attachmentList.map((file) => ({
      filename: file.name,
      content: Buffer.from(file.data, "base64"),
    }));

    let results = [];

    if (individualMode) {
      const recipient = recipientList[0];

      try {
        await sendEmail({
          email: recipient,
          subject,
          message,
          attachments: mailAttachments,
        });

        results.push({
          email: recipient,
          status: "sent",
        });
      } catch (error) {
        results.push({
          email: recipient,
          status: "failed",
          error: error.message,
        });
      }
    } else {
      for (const recipient of recipientList) {
        try {
          await sendEmail({
            email: recipient,
            subject,
            message,
            attachments: mailAttachments,
          });

          results.push({
            email: recipient,
            status: "sent",
          });
        } catch (error) {
          console.log(error);
          results.push({
            email: recipient,
            status: "failed",
            error: error.message,
          });
        }

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

    // ✅ validation
    if (!name || !email || !message) {
      return res.status(400).json("Name, email, and message are required");
    }

    // ✅ email format check
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      return res.status(400).json("Please provide a valid email address");
    }

    // ✅ receiver email
    const toEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_MAIL;

    if (!toEmail) {
      return res.status(500).json("Server email receiver is not configured");
    }

    // ✅ send using reusable function
    await sendEmail({
      email: toEmail,
      subject: `[Contact] ${subject}`,
      message: `
New Contact Message

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `.trim(),
      replyTo: email, // 🔥 so you can reply directly
    });

    return res.status(200).json("Message sent successfully.");
  } catch (error) {
    return res.status(500).json(error?.message || "Failed to send message");
  }
};

export const requestAccountDeletion = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim();
    const report = String(req.body?.report || "").trim();

    if (!name || !email || !report) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and reason are required",
      });
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const receiver = process.env.SMTP_MAIL;

    if (!receiver) {
      return res.status(500).json({
        success: false,
        message: "Server receiver email is not configured",
      });
    }

    await sendEmail({
      email: receiver,
      subject: `Account Delete Request - ${email}`,
      message: `
A user requested account deletion.

Name: ${name}
Email: ${email}

Reason:
${report}

Note: Please review and process within 60 days (policy).
      `.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Your account delete request has been submitted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to send delete request",
    });
  }
};
