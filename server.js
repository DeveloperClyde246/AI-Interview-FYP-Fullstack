const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");

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

//--------------All above is just initial setup, import libraries, wont change much, not so important--------------------------------------------------------------------


// Middleware imports (only used for auth)
const authMiddleware = require("./middleware/authMiddleware");

// import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const recruiterRoutes = require("./routes/recruiter");
const notificationRoutes = require("./routes/notification");
const candidateRoutes = require("./routes/candidate");

// Use the routes
app.use("/auth", authRoutes);
app.use("/admin-dashboard", adminRoutes);
app.use("/recruiter", recruiterRoutes);
app.use("/notifications", notificationRoutes);
app.use("/candidate", candidateRoutes);



// Render home page index.js
app.get("/", (req, res) => res.render("index", { title: "AI Interview Portal" }));


// Protected dashboards
app.get("/dashboard", authMiddleware(["candidate", "interviewee"]), (req, res) => {
  res.render("dashboard", { title: "Dashboard", username: req.cookies.username, role: req.cookies.role });
});

app.get("/admin-dashboard", authMiddleware(["admin"]), (req, res) => {
  res.render("admin-dashboard", { title: "Admin Dashboard", username: req.cookies.username });
});

app.get("/recruiter", authMiddleware(["recruiter"]), (req, res) => {
  res.render("recruiter", { title: "Recruiter Dashboard", username: req.cookies.username });
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
