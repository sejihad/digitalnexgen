import nodeMailer from "nodemailer";

// Your sendEmail function remains as is
const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Create your HTML template with updated footer
  const emailTemplate = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
          }
          .header img {
            width: 150px;
          }
          h1 {
            color: #333;
          }
          p {
            font-size: 16px;
            color: #555;
            line-height: 1.5;
          }
          .footer {
            font-size: 12px;
            color: #aaa;
            padding-top: 20px;
            text-align: center;
            margin-top: 20px;
            border-top: 1px solid #ddd;
          }
          .footer a {
            color: #007bff;
            text-decoration: none;
            margin: 0 5px;
          }
          .footer .social-links {
            margin-top: 10px;
          }
          .social-links a {
            margin: 0 10px;
            text-decoration: none;
            color: #007bff;
          }
          .social-links img {
            width: 24px;
            height: 24px;
          }
        </style>
      </head>
      <body>
        <div class="container">
         <div class="header">
            <a href="https://www.digitalnexgen.co" target="_blank">
              <img src="https://digitalnexgen.co/assets/logo-D1sXeGe2.png" alt="Digital NexGen Logo" />
            </a>
        </div>
          
          <p>${options.message}</p>
          
          <div class="footer">
            <p>Copyright © 2025 Digital NexGen, Ltd.</p>
            <p>Company Number: 16930063</p>
            <p>Suite A, 82 James Carter Road, Mildenhall, Bury St. Edmunds, United Kingdom, IP28 7DE</p>
            <p>Email: <a href="mailto:info@digitalnexgen.co">info@digitalnexgen.co</a></p>
            <p>Phone: +44 7482 799 921</p>
            
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `"Digital NexGen" <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    html: emailTemplate, // Send the HTML email
    attachments: options.attachments || [],
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
