// routes/googleAuth.js
const express = require("express");
const passport = require("passport");
const generateToken = require("../utils/generateToken");
const User = require("../models/userModel");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/mailer");
const { sendSMSCode } = require("../utils/twilioService");
const verificationCodes = require("../utils/smsStore");

const router = express.Router();

// Ruta de inicio de sesión con Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback de Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    session: false,
  }),
  async (req, res) => {
    try {
      const dbUser = await User.findById(req.user._id);
      const token = generateToken(dbUser);

      const { birthDate, phone, address, age, isVerified } = dbUser;
      const isProfileComplete = birthDate && phone && address && age;

      if (!isProfileComplete) {
        return res.redirect(`http://localhost:3000/complete-profile?token=${token}&mode=signin`);
      }

      if (!isVerified) {
        if (!dbUser.verificationToken) {
          dbUser.verificationToken = crypto.randomBytes(32).toString("hex");
          await dbUser.save();
        }

        await sendVerificationEmail(dbUser.email, dbUser.verificationToken);
        return res.redirect(`http://localhost:3000/?verify=google`);
      }

      // 🔐 Si verificado, enviar código SMS
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      verificationCodes.set(dbUser._id.toString(), code);
      await sendSMSCode(dbUser.phone, code);

      // Redirigir con token y userId (para el popup de verificación)
      return res.redirect(`http://localhost:3000/?token=${token}&userId=${dbUser._id}`);
    } catch (error) {
      console.error("❌ Error en Google callback:", error);
      res.redirect("/");
    }
  }
);

module.exports = router;
