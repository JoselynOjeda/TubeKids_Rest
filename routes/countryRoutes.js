const express = require('express');
const router = express.Router();
const Country = require('../models/countryModel');

router.get('/', async (req, res) => {
  try {
    const countries = await Country.find({}, 'name code'); 
    res.status(200).json(countries);
  } catch (err) {
    console.error("❌ Error fetching countries:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
