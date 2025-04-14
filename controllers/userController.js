const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../mailer');

// Función para generar token
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    pin: user.pin,
    role: "admin"
  };

  return jwt.sign(payload, "tube_kids", { expiresIn: '90d' });
};

// 📥 Registro
exports.signup = async (req, res) => {
  const { email, password, phone, pin, name, surname, country, birthDate } = req.body;

  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  if (age < 18) {
    return res.status(400).json({ message: 'You must be at least 18 years old to register.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await User.create({
      email,
      password: hashedPassword,
      phone,
      pin,
      name,
      surname,
      country,
      birthDate,
      isVerified: false,
      verificationToken
    });

    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      status: 'pending',
      message: 'Registration successful! Please check your email to verify your account.'
    });
  } catch (error) {
    console.error("❌ Error durante el registro:", error);
    res.status(500).json({ message: 'Error signing up user', error });
  }
};

// 🔓 Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password!' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Error comparing passwords' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect email or password' });
      }

      const token = generateToken(user);

      res.status(200).json({
        status: 'success',
        token,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            surname: user.surname,
            phone: user.phone,
            country: user.country,
            birthDate: user.birthDate,
          }
        }
      });
    });

  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// ✅ Verificación de email
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.redirect('http://localhost:3000'); // o la URL de tu frontend
  } catch (error) {
    console.error('❌ Error verifying email:', error);
    res.status(500).json({ message: 'Error verifying email.' });
  }
};
