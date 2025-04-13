const express = require("express");
const router = express.Router();
const auth = require("../middleware/authenticate");
const ensureAdmin = require("../middleware/ensureAdmin");
const videoController = require("../controllers/videoController");

router.post("/", auth, ensureAdmin, videoController.createVideo);
router.put("/:id", auth, ensureAdmin, videoController.updateVideo);
router.delete("/:id", auth, ensureAdmin, videoController.deleteVideo);

module.exports = router;