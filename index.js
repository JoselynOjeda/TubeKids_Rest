const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const authenticate = require('./middleware/authenticate');
const passport = require("passport")
require("dotenv").config();
require("./auth/google")


const app = express();

console.log("Secret used for JWT:", process.env.JWT_SECRET);

app.use(cors({
  origin: "http://localhost:3000", // Permitir peticiones solo desde el front-end
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(bodyParser.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.error("❌ Error conectando a MongoDB:", err));

// Importar rutas
const countryRoutes = require('./routes/countryRoutes');
const userRoutes = require("./routes/userRoutes"); 
const restrictedUserRoutes = require('./routes/restrictedUserRoutes');
const playlistRoutes = require("./routes/playlistRoutes");
const videoRoutes = require("./routes/videoRoutes");
const completeProfileRoute = require("./routes/completeProfileRoute");

// Usar rutas
app.use("/api/users", require("./routes/googleAuth"))
app.use("/api/users", userRoutes);
app.use('/api/restricted-users', authenticate, restrictedUserRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/countries", countryRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
