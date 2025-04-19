const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/userModel")
const crypto = require("crypto")
const { sendVerificationEmail } = require("../utils/mailer")

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id })

        if (!user) {
          const verificationToken = crypto.randomBytes(32).toString("hex")

          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.name.givenName,
            surname: profile.name.familyName,
            isVerified: false,
            verificationToken,
          })

          await sendVerificationEmail(user.email, verificationToken)
        }

        done(null, user)
      } catch (err) {
        done(err, null)
      }
    }
  )
)

module.exports = passport