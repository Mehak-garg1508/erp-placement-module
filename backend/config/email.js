const nodemailer = require("nodemailer");

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Tera gmail
    pass: process.env.EMAIL_PASSWORD, // App password (neeche steps)
  },
});

// Reusable email function
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"ERP Placement" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("Email error:", error.message);
  }
};

module.exports = sendEmail;
