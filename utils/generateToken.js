const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    pin: user.pin,
    role: "admin" // o puedes dejarlo dinámico si lo tienes en el modelo
  };

  return jwt.sign(payload, process.env.JWT_SECRET || "tube_kids", {
    expiresIn: "90d",
  });
};

module.exports = generateToken;
