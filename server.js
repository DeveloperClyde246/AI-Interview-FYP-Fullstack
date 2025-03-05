const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");

// Middleware imports
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up EJS for templating
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(expressLayouts);
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Ensure routes are properly required and used
const authRoutes = require("./routes/auth");
//const interviewRoutes = require("./routes/interview");
//const notificationRoutes = require("./routes/notification");
//const recruiterRoutes = require("./routes/recruiter");


// Use the routes
app.use("/auth", authRoutes);
//app.use("/interviews", interviewRoutes);
//app.use("/notifications", notificationRoutes);
//app.use("/recruiter", recruiterRoutes);

// Render home page
app.get("/", (req, res) => res.render("index", { title: "AI Interview Portal" }));

// Protected dashboards
app.get("/dashboard", authMiddleware(["candidate", "interviewee"]), (req, res) => {
  res.render("dashboard", { title: "Dashboard", username: req.cookies.username, role: req.cookies.role });
});

app.get("/admin-dashboard", authMiddleware(["admin"]), (req, res) => {
  res.render("admin-dashboard", { title: "Admin Dashboard", username: req.cookies.username });
});

app.get("/recruiter-dashboard", authMiddleware(["recruiter"]), (req, res) => {
  res.render("recruiter-dashboard", { title: "Recruiter Dashboard", username: req.cookies.username });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
