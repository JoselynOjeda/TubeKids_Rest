const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Video", videoSchema);
