const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "tube_kids";

router.post("/complete-profile", async (req, res) => {
  try {
    const { token, phone, address, birthDate } = req.body;

    if (!token) return res.status(401).json({ message: "Token missing" });

    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        phone,
        address,
        birthDate,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Profile completion error:", error);
    return res.status(500).json({ message: "Failed to complete profile" });
  }
});

module.exports = router;
