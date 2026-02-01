const express = require("express");
const User = require("../models/User");
const { auth, isAdmin } = require("../middleware/auth");

const router = express.Router();

// list users (admin)
router.get("/", auth, isAdmin, async (req, res, next) => {
  try {
    const users = await User.find().select("_id name email role createdAt");
    res.json(users);
  } catch (e) {
    next(e);
  }
});

// set role (admin)
router.patch("/:id/role", auth, isAdmin, async (req, res, next) => {
  try {
    const role = req.body?.role;
    if (!["user", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true }
    ).select("_id name email role");

    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
