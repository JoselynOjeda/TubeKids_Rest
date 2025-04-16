const axios = require('axios');

const sendVerificationEmail = async (toEmail, token) => {
  try {
    const response = await axios.post(
      'https://api.mailersend.com/v1/email',
      {
        from: {
          email: 'noreply@test-zxk54v8zde6ljy6v.mlsender.net',
          name: 'TubeKids'
        },
        to: [
          {
            email: toEmail,
            name: 'New User'
          }
        ],
        subject: 'Verify your email',
        html: `
          <p>Hello! Please verify your email address by clicking the link below:</p>
          <a href="http://localhost:5000/api/users/verify/${token}">Verify Email</a>
        `
      },
      {
        headers: {
          Authorization: `Bearer mlsn.5d9c1272a28d93a41d889168fdcc3b1f4ee254340719071c9436a4f9abdfc042`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Email sent successfully", response.data);
  } catch (error) {
    console.error("❌ Error sending verification email:", error.response?.data || error.message);
  }
};

module.exports = { sendVerificationEmail };
