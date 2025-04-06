const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  assignedProfiles: [
    {
      type: String, // ID del perfil restringido (puede ser un ObjectId si quieres referenciar otra colección)
      required: true
    }
  ],
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    }
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // si tenés una colección de usuarios
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
