const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { q, pageToken = "" } = req.query;

    console.log("🔎 Searching:", q); // debug
    console.log("🔑 API Key used:", process.env.YOUTUBE_API_KEY); // debug

    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        q,
        part: "snippet",
        type: "video",
        maxResults: 10,
        pageToken,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ YouTube Search Error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch YouTube videos" });
  }
});

module.exports = router;
