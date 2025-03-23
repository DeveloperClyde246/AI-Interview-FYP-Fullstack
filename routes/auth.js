const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Frontend check: who is logged in
router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not logged in" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ username: decoded.name, role: decoded.role });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Show Register Page (EJS)
router.get("/register", (req, res) => {
  res.render("register", { title: "Register", errorMessage: null });
});

// Handle Register (EJS only)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const role = "candidate";

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.render("register", { title: "Register", errorMessage: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.redirect("/auth/login");
  } catch (err) {
    res.render("register", { title: "Register", errorMessage: "Server error" });
  }
});

// Show Login Page (EJS)
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", errorMessage: null });
});

// ✅ Handle Login (EJS + React friendly)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const isMatch = user && await bcrypt.compare(password, user.password);
    const isAPI = req.headers.accept && req.headers.accept.includes("application/json");

    if (!user || !isMatch) {
      // EJS form
      if (!isAPI) {
        return res.render("login", {
          title: "Login",
          errorMessage: "Invalid email or password",
        });
      }
      // React frontend
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });
    res.cookie("username", user.name, { httpOnly: true });
    res.cookie("role", user.role, { httpOnly: true });

    // React frontend → send JSON
    if (isAPI) {
      return res.json({ success: true, role: user.role });
    }

    // EJS form → redirect
    if (user.role === "admin") return res.redirect("/admin-dashboard");
    if (user.role === "recruiter") return res.redirect("/recruiter");
    return res.redirect("/candidate");

  } catch (err) {
    const isAPI = req.headers.accept && req.headers.accept.includes("application/json");

    if (!isAPI) {
      return res.render("login", {
        title: "Login",
        errorMessage: "Server error",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// Logout for both EJS and React
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("username");
  res.clearCookie("role");

  const isAPI = req.headers.accept && req.headers.accept.includes("application/json");

  if (isAPI) {
    res.json({ message: "Logged out" });
  } else {
    res.redirect("/auth/login");
  }
});

module.exports = router;
