const jwt = require('jsonwebtoken');

// Clave secreta para verificar los tokens JWT.
// Se intenta usar una variable de entorno (más segura para producción),
// y si no existe, se usa un valor por defecto ("tube_kids").
const SECRET_KEY = process.env.JWT_SECRET || "tube_kids";

// Middleware de autenticación para proteger rutas privadas
const authenticate = (req, res, next) => {
    // Obtener el header de autorización del cliente
    const authHeader = req.headers.authorization;
    console.log(`Authorization Header: ${authHeader}`);

    // Si no se proporciona el header o no comienza con "Bearer ", se rechaza la solicitud
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Access denied. No token provided.');
    }

    // Extraer el token JWT del header (después de "Bearer ")
    const token = authHeader.split(' ')[1];

    // Verificar el token usando la clave secreta
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(400).send(`Invalid token: ${err.message}`);
        }

        // Si el token es válido, agregar los datos del usuario decodificado al objeto `req`
        req.user = decoded;

        // Pasar al siguiente middleware o controlador
        next();
    });
};

// Exportar el middleware para que pueda ser usado en otras rutas
module.exports = authenticate;
