const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: { type: String }, // Se añade para usuarios de Google
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, select: false }, // ya no es obligatorio
  phone: { type: String }, // también puede completarse luego
  pin: { type: String },
  name: String,
  surname: String,
  country: String,
  birthDate: Date,
  address: { type: String },
  age: { type: Number },

  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },

  // Verificación por SMS
  smsCode: { type: String },
  smsCodeExpires: { type: Date }
});

// Método para comparar contraseñas
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
