const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Show Register Page
router.get("/register", (req, res) => {
  res.render("register", { title: "Register", errorMessage: null });
});



// Handle User Registration
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.render("register", { title: "Register", errorMessage: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });

    await user.save();
    res.redirect("/auth/login");
  } catch (err) {
    res.render("register", { title: "Register", errorMessage: "Server error" });
  }
});



// Show Login Page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", errorMessage: null });
});



// Handle User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { title: "Login", errorMessage: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { title: "Login", errorMessage: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Store JWT in cookie (for session handling)
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (err) {
    res.render("login", { title: "Login", errorMessage: "Server error" });
  }
});


// Handle User Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

module.exports = router;
