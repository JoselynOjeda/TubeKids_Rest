const RestrictedUser = require('../models/restrictedModel');

// Middleware para asegurar que el usuario autenticado no sea un perfil restringido
const ensureAdmin = async (req, res, next) => {
  try {
    // Buscar en la colección de perfiles restringidos usando el ID del usuario autenticado
    const isRestricted = await RestrictedUser.findOne({ _id: req.user.id });

    // Si se encuentra, significa que el usuario es restringido y no debe acceder
    if (isRestricted) {
      return res.status(403).json({ message: "Access denied for restricted users." });
    }

    // Si no es un usuario restringido, continuar con la siguiente función middleware o ruta
    next();
  } catch (error) {
    // Manejo de errores en caso de fallo al verificar el tipo de usuario
    console.error("Error checking user role:", error);
    res.status(500).json({ message: "Server error validating user type." });
  }
};

// Exportar el middleware para usarlo en rutas protegidas que requieren rol de administrador
module.exports = ensureAdmin;
