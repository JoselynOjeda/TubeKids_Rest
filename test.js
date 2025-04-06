const bcrypt = require('bcryptjs');

const password = "123456"; // Contraseña original
const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error("Error generando hash:", err);
    } else {
        console.log("🔐 Nuevo hash generado:", hash);

        bcrypt.compare(password, hash, (err, result) => {
            console.log("✅ ¿Las contraseñas coinciden?", result);
        });
    }
});
