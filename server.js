const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");

//middleware import
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/auth");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Set up EJS
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(expressLayouts);
app.use(express.static("public"));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Routes
app.use("/auth", require("./routes/auth"));

// Render home page
app.get("/", (req, res) => res.render("index", { title: "AI Interview Portal" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//to use the middleware
app.use(cookieParser());

app.get("/dashboard", authMiddleware, (req, res) => {
    res.render("dashboard", { title: "Dashboard", user: req.user });
  });