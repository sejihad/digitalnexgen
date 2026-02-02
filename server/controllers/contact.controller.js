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
          from: `"Digita NexGen" <${process.env.SMTP_MAIL}>`,

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
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Email sending failed",
    });
  }
};
