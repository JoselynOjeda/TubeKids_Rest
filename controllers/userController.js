const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Para hashear y comparar contraseñas

//
// 🔐 Función para generar un token JWT
//
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    pin: user.pin,
    role: "admin" // Todos los usuarios registrados son administradores por defecto
  };

  // Firmar el token con una clave secreta y expiración de 90 días
  return jwt.sign(payload, "tube_kids", { expiresIn: '90d' });
};

//
// 📥 Registro de un nuevo usuario
//
exports.signup = async (req, res) => {
  const { email, password, phone, pin, name, surname, country, birthDate } = req.body;

  // 🧓 Verificar que el usuario tenga al menos 18 años
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
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // 🔐 Hashear la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("🔐 Contraseña original:", password);
    console.log("🧂 Salt generado:", salt);
    console.log("🔒 Contraseña hasheada:", hashedPassword);

    // Crear el nuevo usuario en la base de datos
    const newUser = await User.create({
      email,
      password: hashedPassword,
      phone,
      pin,
      name,
      surname,
      country,
      birthDate
    });

    // Generar token JWT para iniciar sesión automáticamente después del registro
    const token = generateToken(newUser);

    console.log("✅ Usuario registrado con éxito:", email);

    // Enviar respuesta sin incluir la contraseña
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          surname: newUser.surname,
          phone: newUser.phone,
          country: newUser.country,
          birthDate: newUser.birthDate,
        }
      }
    });
  } catch (error) {
    console.error("❌ Error durante el registro:", error);
    res.status(500).json({ message: 'Error signing up user', error });
  }
};

//
// 🔓 Inicio de sesión de usuario
//
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Verificar que se hayan enviado ambos campos
  if (!email || !password) {
    console.log("⚠️ Falta email o contraseña en la solicitud.");
    return res.status(400).json({ message: 'Please provide email and password!' });
  }

  try {
    console.log(`🔍 Buscando usuario con email: ${email}`);

    // Buscar usuario por email y recuperar el campo `password` explícitamente
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log("❌ Usuario no encontrado:", email);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    console.log("User object:", user);
    console.log("🟢 Usuario encontrado:", user.email);
    console.log("🔑 Contraseña ingresada:", password);
    console.log("🔒 Contraseña almacenada (hash en la BD):", user.password);

    // Comparar contraseña ingresada con el hash guardado en la base de datos
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("❌ Error comparando contraseñas:", err);
        return res.status(500).json({ message: 'Error comparing passwords' });
      }

      console.log(`🔄 Comparación bcrypt: ${isMatch}`);

      if (!isMatch) {
        console.log("❌ Contraseña incorrecta");
        return res.status(401).json({ message: 'Incorrect email or password' });
      }

      console.log("✅ Contraseña correcta, generando token...");

      // Generar token de sesión
      const token = generateToken(user);
      console.log("🔐 Token generado:", token);

      // Enviar datos del usuario (sin contraseña)
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
    console.error("❌ Error durante el login:", error);
    res.status(500).json({ message: 'Error logging in', error });
  }
};
