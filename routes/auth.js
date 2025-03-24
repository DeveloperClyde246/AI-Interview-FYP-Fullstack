const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ✅ Who is logged in (used by frontend after login)
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

// ✅ Register a new user (candidate by default)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const role = "candidate"; // All new users default to candidate

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login (React sends credentials)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const isMatch = user && await bcrypt.compare(password, user.password);

    if (!user || !isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // use true in production with HTTPS
    });

    res.cookie("username", user.name, { httpOnly: true });
    res.cookie("role", user.role, { httpOnly: true });

    res.json({ success: true, username: user.name, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("username");
  res.clearCookie("role");
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
  
  // The  /me  route is used by the frontend to check if a user is logged in. It reads the JWT token from the cookie, verifies it, and sends back the username and role. 
  // The  /register  route is used to register a new user. It checks if the email is valid and not already in use, hashes the password, and saves the user to the database. 
  // The  /login  route is used to log in a user. It checks if the email exists and the password is correct, then creates a JWT token and sets it as a cookie. It also sets the username and role as cookies for easy access in the frontend. 
  // The  /logout  route is used to log out a user. It clears the cookies and sends a response. 
  // Now, let’s add these routes to the main Express app.