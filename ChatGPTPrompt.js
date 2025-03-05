
































//---------------------------------------------------Previous code for reference------------------------------

// //this is code for /routes/auth.js-----------------------------------------------------------------------------------
// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const router = express.Router();

// // Show Register Page (Only for Candidates)
// router.get("/register", (req, res) => {
//   res.render("register", { title: "Register", errorMessage: null });
// });

// // Handle User Registration (Only for Candidates)
// router.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;
//   const role = "candidate"; // Default role for new registrations

//   try {
//     // 1. Check if the email is already registered
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.render("register", { title: "Register", errorMessage: "Email already in use" });
//     }

//     // 2. Hash the password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);
    
//     // 3. Create and save the user
//     user = new User({ name, email, password: hashedPassword, role });
//     await user.save();

//     // 4. Redirect to login page
//     res.redirect("/auth/login");
//   } catch (err) {
//     res.render("register", { title: "Register", errorMessage: "Server error" });
//   }
// });

// // Show Login Page
// router.get("/login", (req, res) => {
//   res.render("login", { title: "Login", errorMessage: null });
// });

// // Handle User Login (Supports Multiple Roles)
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // 1. Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.render("login", { title: "Login", errorMessage: "Invalid email or password" });
//     }

//     // 2. Check if the entered password matches the stored hashed password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.render("login", { title: "Login", errorMessage: "Invalid email or password" });
//     }

//     // 3. Generate a JWT token with user role
//     const token = jwt.sign(
//       { id: user._id, name: user.name, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );



//     // 4. Store JWT and role in cookies
//     res.cookie("token", token, { httpOnly: true });
//     res.cookie("username", user.name, { httpOnly: true });
//     res.cookie("role", user.role, { httpOnly: true });

//     // 5. Redirect based on role
//     if (user.role === "admin") {
//       res.redirect("/admin-dashboard");
//     } else if (user.role === "recruiter") {
//       res.redirect("/recruiter-dashboard");
//     } else {
//       res.redirect("/dashboard");
//     }
//   } catch (err) {
//     res.render("login", { title: "Login", errorMessage: "Server error" });
//   }
// });

// // Handle User Logout
// router.get("/logout", (req, res) => {
//   res.clearCookie("token");
//   res.clearCookie("username");
//   res.clearCookie("role");
//   res.redirect("/auth/login");
// });

// module.exports = router;



// /*
// //Info for chatgpt: dont delete comment below, keep them in ur answer, they are useful bro
// //LET HIM COOK!!!!!
// //Future me: i didnt read detailed how JWT work, so i just copy paste it from the tutorial， 记得哈哈哈
// //Future you: I hate u

// //bro
// broooooooooo i cant handle anymore
// */



// //this is code for /middleware/authMiddleware.js-----------------------------------
// const jwt = require("jsonwebtoken");

// const authMiddleware = (roles = []) => {
//   return (req, res, next) => {
//     const token = req.cookies?.token;
//     if (!token) {
//       return res.redirect("/auth/login"); // Redirect if no token found
//     }

//     try {
//       // Verify JWT token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded; // Attach user data to request object

//       // Debugging: Log user role
//       console.log("User Role:", req.user.role);

//       // Check if user has the required role
//       if (roles.length && !roles.includes(req.user.role)) {
//         console.log("Unauthorized access");
//         return res.status(403).json({ message: "Unauthorized access" });
//       }

//       next(); // Proceed to the next middleware
//     } catch (err) {
//       res.redirect("/auth/login");
//     }
//   };
// };

// module.exports = authMiddleware;



// //this is code for /models/User.js
// //this is db schema (structure) for user
// //this is a model for user

// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { 
//     type: String, 
//     enum: ["admin", "candidate", "recruiter"], 
//     required: true 
//   },
//   interviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interview" }], // References interviews
//   createdAt: { type: Date, default: Date.now }, // Timestamp for user creation
//   updatedAt: { type: Date, default: Date.now }  // Timestamp for updates
// });

// module.exports = mongoose.model("User", UserSchema);





// //this is code for /server.js-----------------------------------------------------------------------------------
// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const expressLayouts = require("express-ejs-layouts");
// const cookieParser = require("cookie-parser");

// dotenv.config();

// const app = express();

// // Middleware setup
// app.use(express.json());
// app.use(cors());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Set up EJS for templating
// app.set("view engine", "ejs");
// app.set("views", "./views");
// app.use(expressLayouts);
// app.use(express.static("public"));

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch(err => console.error("❌ MongoDB Connection Error:", err));

// //-------------All above is just initial setup, import libraries, wont change much, not so important-------------------


// // Middleware imports (only used for auth)
// const authMiddleware = require("./middleware/authMiddleware");

// // import routes
// const authRoutes = require("./routes/auth");
// //const interviewRoutes = require("./routes/interview");
// //const notificationRoutes = require("./routes/notification");
// //const recruiterRoutes = require("./routes/recruiter");


// // Use the routes
// app.use("/auth", authRoutes);
// //app.use("/interviews", interviewRoutes);
// //app.use("/notifications", notificationRoutes);
// //app.use("/recruiter", recruiterRoutes);


// // Render home page index.js
// app.get("/", (req, res) => res.render("index", { title: "AI Interview Portal" }));


// // Protected dashboards
// app.get("/dashboard", authMiddleware(["candidate", "interviewee"]), (req, res) => {
//   res.render("dashboard", { title: "Dashboard", username: req.cookies.username, role: req.cookies.role });
// });

// app.get("/admin-dashboard", authMiddleware(["admin"]), (req, res) => {
//   res.render("admin-dashboard", { title: "Admin Dashboard", username: req.cookies.username });
// });

// app.get("/recruiter-dashboard", authMiddleware(["recruiter"]), (req, res) => {
//   res.render("recruiter-dashboard", { title: "Recruiter Dashboard", username: req.cookies.username });
// });


// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



// //this is code for /views/dashboard.ejs-----------------------------------------------------------------------------------
// <h2>Welcome, <%= username %>!</h2>
// <p>Your role: <strong><%= role %></strong></p>

// <% /* %>

// <% if (role === "admin") { %>
//   <a href="/manage-users">Manage Users</a>
// <% } else if (role === "candidate") { %>
//   <a href="/interviews">Start Interview</a>
// <% } else if (role === "interviewee") { %>
//   <a href="/results">View Results</a>
// <% } else if (role === "recruiter") { %>
//   <a href="/schedule-interviews">Schedule Interviews</a>
//   <a href="/view-candidates">View Candidates</a>
// <% } else { %>
//   <a>No roles assigned</a>
// <% } %>

// <% */ %>

// <a href="/auth/logout">Logout</a>

