const express = require("express");
const router = express.Router();
const auth = require("../middleware/authenticate");
const ensureAdmin = require("../middleware/ensureAdmin");
const playlistController = require("../controllers/playlistController");

router.post("/", auth, ensureAdmin, playlistController.createPlaylist);
router.get("/", auth, ensureAdmin, playlistController.getPlaylists);
router.put("/:id", auth, ensureAdmin, playlistController.updatePlaylist);
router.delete("/:id", auth, ensureAdmin, playlistController.deletePlaylist);

module.exports = router;