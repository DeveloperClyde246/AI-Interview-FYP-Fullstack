const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Ensure only admins can access these routes
router.use(authMiddleware(["admin"]));

// View all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.render("admin-dashboard", { title: "Admin Dashboard", users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Create a new user
router.post("/create", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 1. Check if the email is already registered
    let user = await User.findOne({ email });
    if (user) return res.json({ message: "Email already exists" });

    // 2. Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create and save the user
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    // 4. Redirect to login page
    res.redirect("/admin-dashboard");
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

// Edit user details
router.post("/edit/:id", async (req, res) => {
  const { name, email, role } = req.body;
  try {
    await User.findByIdAndUpdate(req.params.id, { name, email, role });
    res.redirect("/admin-dashboard");
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
});

// Delete a user
router.post("/delete/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    // Prevent deleting the main admin account
    if (user.email === "mainAdmin@gmail.com") {
      return res.status(403).json({ message: "Cannot delete the main admin account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin-dashboard");
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});


module.exports = router;
