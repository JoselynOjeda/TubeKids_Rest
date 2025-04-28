const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/mailer');
const twilioClient = require('../utils/twilioService');

const verificationCodes = require('../utils/smsStore');

// Función para generar token JWT
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

// Registro
exports.signup = async (req, res) => {
  const { email, password, phone, pin, name, surname, country, birthDate } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

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

    
    await sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.status(201).json({
      status: 'pending',
      message: 'User created and verification email sent',
    });
  } catch (error) {
    console.error("❌ Error during signup:", error);
    res.status(500).json({ message: 'Error signing up user', error });
  }
};



// Login con 2FA (envío SMS)
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
      return res.status(403).json({ message: 'Please verify your email before logging in.', userId: user._id });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Generar código SMS
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(user._id.toString(), code);

    await twilioClient.sendSMSCode(user.phone, code);

    return res.status(200).json({
      status: 'pending',
      message: 'Verification code sent via SMS',
      userId: user._id,
      requiresVerification: true 
    });

  } catch (error) {
    console.error("❌ Error en login:", error); 
    res.status(500).json({ message: 'Error logging in', error });
  }
};


// Confirmación del código SMS
exports.verifySmsCode = async (req, res) => {
  const { userId, code } = req.body;

  console.log("🔐 Verificando código SMS...");
  console.log("➡️ userId:", userId);
  console.log("➡️ Código recibido:", code);

  const storedCode = verificationCodes.get(userId);
  console.log("🧠 Código guardado:", storedCode);

  if (!storedCode || storedCode !== code) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  try {
    const user = await User.findById(userId);
    const token = generateToken(user);

    verificationCodes.delete(userId);

    return res.status(200).json({
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
  } catch (error) {
    console.error("❌ Error verifying code:", error);
    res.status(500).json({ message: 'Error verifying code', error });
  }
};


// Verificación de email
exports.verifyEmail = async (req, res) => {
  const token = decodeURIComponent(req.params.token);

  if (!token) {
    return res.status(400).json({ message: "Token missing" });
  }

  console.log("🚀 Iniciando verificación de email...");
  console.log("📦 Token recibido:", token);

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      
      const verifiedUser = await User.findOne({ isVerified: true, verificationToken: { $exists: false } });

      if (verifiedUser) {
        console.log("🔵 Usuario ya estaba verificado");
        return res.status(200).json({ alreadyVerified: true, message: 'Email was already verified.' });
      }

      console.log("🔴 Token inválido o usuario no encontrado");
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    console.log("✅ Usuario verificado correctamente");
    return res.status(200).json({ message: 'Email successfully verified!' });

  } catch (error) {
    console.error('❌ Error verifying email:', error);
    return res.status(500).json({ message: 'Error verifying email.' });
  }
};









exports.completeGoogleProfile = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tube_kids");
    const userId = decoded.id;
    const { birthDate } = req.body;

    if (birthDate) {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      if (age < 18) return res.status(400).json({ message: 'You must be at least 18 years old.' });
      req.body.age = age;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { ...req.body }, { new: true });

    // 🔥 Si aún no está verificado, generar token y mandar correo
    if (!updatedUser.isVerified) {
      if (!updatedUser.verificationToken) {
        updatedUser.verificationToken = crypto.randomBytes(32).toString("hex");
        await updatedUser.save();
      }
      await sendVerificationEmail(updatedUser.email, updatedUser.verificationToken);
    }

    return res.status(200).json({ message: "Profile completed", emailSent: !updatedUser.isVerified });
  } catch (err) {
    console.error("Error completing profile:", err);
    return res.status(400).json({ message: 'Invalid token or update failed' });
  }
};

exports.getMe = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "tube_kids");
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    return res.status(400).json({ message: "Invalid token" });
  }

};

exports.resendCode = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.phone) {
      return res.status(404).json({ message: "User not found or missing phone number" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(userId, code);
    await sendSMSCode(user.phone, code);

    return res.status(200).json({ message: "Code resent" });
  } catch (error) {
    console.error("❌ Error resending code:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



