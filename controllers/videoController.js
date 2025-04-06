const Video = require("../models/videoModel");

//
// 📥 Obtener todos los videos del usuario autenticado
//
const getVideos = async (req, res) => {
    try {
        // Solo obtiene los videos creados por el usuario actual
        const videos = await Video.find({ userId: req.user.id });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//
// 🔎 Obtener un video específico por ID
//
const getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ error: "Video no encontrado" });

        res.json(video);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//
// ➕ Crear un nuevo video
//
const createVideo = async (req, res) => {
    try {
        const { name, url, description, thumbnail } = req.body;

        // Validación básica de campos obligatorios
        if (!name || !url) {
            return res.status(400).json({ message: "Name and URL are required." });
        }

        // Crear instancia de video con el userId del usuario autenticado
        const newVideo = new Video({
            userId: req.user.id, // ← del middleware de autenticación
            name,
            url,
            description,
            thumbnail
        });

        // Guardar el video en la base de datos
        const savedVideo = await newVideo.save();
        res.status(201).json(savedVideo);
    } catch (error) {
        console.error("Error creating video:", error);
        res.status(500).json({ message: "Server error." });
    }
};

//
// ✏️ Actualizar un video existente
//
const updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, description, thumbnail } = req.body;

        // Validación de campos requeridos
        if (!name || !url) {
            return res.status(400).json({ error: "El nombre y la URL son obligatorios." });
        }

        // Buscar y actualizar el video
        const video = await Video.findByIdAndUpdate(
            id,
            { name, url, description, thumbnail },
            { new: true } // ← devuelve el documento actualizado
        );

        if (!video) {
            return res.status(404).json({ error: "Video no encontrado" });
        }

        res.json(video);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//
// ❌ Eliminar un video por ID
//
const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id);
        if (!video) return res.status(404).json({ error: "Video no encontrado" });

        res.json({ mensaje: "Video eliminado" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//
// 🧩 Exportar controladores
//
module.exports = {
    getVideos,
    createVideo,
    updateVideo,
    deleteVideo,
    getVideoById
};
