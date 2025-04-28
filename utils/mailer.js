const axios = require('axios');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // 🔥

const sendVerificationEmail = async (toEmail, token) => {
  try {
    await axios.post(
      'https://api.mailersend.com/v1/email',
      {
        from: {
          email: 'noreply@test-zxk54v8zde6ljy6v.mlsender.net',
          name: 'TubeKids'
        },
        to: [{ email: toEmail, name: "New User" }],
        subject: 'Verify your email',
        html: `
          <p>Hello! Please verify your email address by clicking the link below:</p>
          <a href="${FRONTEND_URL}/verify-email/${encodeURIComponent(token)}">Verify Email</a>
        `
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Error sending verification email:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
