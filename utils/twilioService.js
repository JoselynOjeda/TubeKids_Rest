// utils/twilioService.js
require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMSCode = async (phoneNumber, code) => {
  try {
    const message = await client.messages.create({
      body: `Your TubeKids verification code is: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log("✅ SMS sent:", message.sid);
  } catch (error) {
    console.error("❌ Error sending SMS:", error);
    throw error;
  }
};

module.exports = { sendSMSCode };
