const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Show Register Page (Only for Candidates)
router.get("/register", (req, res) => {
  res.render("register", { title: "Register", errorMessage: null });
});

// Handle User Registration (Only for Candidates)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const role = "candidate"; // Default role for new registrations

  try {
    // 1. Check if the email is already registered
    let user = await User.findOne({ email });
    if (user) {
      return res.render("register", { title: "Register", errorMessage: "Email already in use" });
    }

    // 2. Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Create and save the user
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    // 4. Redirect to login page
    res.redirect("/auth/login");
  } catch (err) {
    res.render("register", { title: "Register", errorMessage: "Server error" });
  }
});

// Show Login Page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", errorMessage: null });
});

// Handle User Login (Supports Multiple Roles)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { title: "Login", errorMessage: "Invalid email or password" });
    }

    // 2. Check if the entered password matches the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { title: "Login", errorMessage: "Invalid email or password" });
    }

    // 3. Generate a JWT token with user role
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4. Store JWT and role in cookies
    res.cookie("token", token, { httpOnly: true });
    res.cookie("username", user.name, { httpOnly: true });
    res.cookie("role", user.role, { httpOnly: true });

    // 5. Redirect based on role
    if (user.role === "admin") {
      res.redirect("/admin-dashboard");
    } else if (user.role === "recruiter") {
      res.redirect("/recruiter-dashboard");
    } else {
      res.redirect("/dashboard");
    }
  } catch (err) {
    res.render("login", { title: "Login", errorMessage: "Server error" });
  }
});

// Handle User Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("username");
  res.clearCookie("role");
  res.redirect("/auth/login");
});

module.exports = router;



/*
//Info for chatgpt: dont delete comment below, keep them in ur answer, they are useful bro
//LET HIM COOK!!!!!
//Future me: i didnt read detailed how JWT work, so i just copy paste it from the tutorial， 记得哈哈哈
//Future you: I hate u

//bro


broooooooooo i cant handle anymore
*/