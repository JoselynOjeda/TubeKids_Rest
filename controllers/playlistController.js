// controllers/playlistController.js
const Playlist = require('../models/playlistModel');

//
// 📀 Crear una nueva playlist
//
exports.createPlaylist = async (req, res) => {
  try {
    const { name, assignedProfiles, description } = req.body;

    // Validación básica
    if (!name || !assignedProfiles || assignedProfiles.length === 0) {
      return res.status(400).json({ message: "Name and assignedProfiles are required." });
    }

    // Crear instancia de Playlist con el ID del usuario que está autenticado
    const newPlaylist = new Playlist({
      name,
      assignedProfiles,
      description,
      userId: req.user.id, // ID del admin que creó la playlist
      videos: [] // Se crea vacía inicialmente
    });

    const saved = await newPlaylist.save(); // Guardar en BD
    res.status(201).json(saved); // Respuesta con la playlist creada
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//
// 📂 Obtener todas las playlists del usuario autenticado
//
exports.getPlaylists = async (req, res) => {
  try {
    // Buscar todas las playlists donde el userId coincida con el del token
    const playlists = await Playlist.find({ userId: req.user.id });
    res.status(200).json(playlists); // Devolver lista de playlists
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//
// ✏️ Actualizar una playlist existente
//
exports.updatePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const { name, description, assignedProfiles, videos } = req.body;

    // Buscar por ID y actualizar con los nuevos datos
    const updated = await Playlist.findByIdAndUpdate(
      playlistId,
      { name, description, assignedProfiles, videos },
      { new: true } // Devolver el documento actualizado
    );

    res.status(200).json(updated); // Respuesta con la playlist modificada
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//
// 🗑 Eliminar una playlist por ID
//
exports.deletePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;

    // Buscar y eliminar la playlist
    await Playlist.findByIdAndDelete(playlistId);
    res.status(200).json({ message: "Playlist deleted." });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({ message: "Server error." });
  }
};
