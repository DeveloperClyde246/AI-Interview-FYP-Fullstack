const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const Interview = require("../models/Interview");
const User = require("../models/User");
const multer = require("multer");
const mongoose = require("mongoose");

const router = express.Router();

// Ensure only recruiters can access these routes
router.use(authMiddleware(["recruiter"]));

// Recruiter Dashboard
router.get("/", async (req, res) => {
    try {
      const recruiterId = new mongoose.Types.ObjectId(req.user.id);

        // Fetch notifications for this recruiter
        const notifications =await Notification.find({ userId: "67c80e2255dd45082cecb430" })
        .sort({ createdAt: -1 });

         // Fetch interviews assigned to this recruiter
        const interviews = await Interview.find({ recruiterId })
        .populate("candidates", "name email") // ✅ Use "candidates" instead of "candidateId"
        .sort({ scheduled_date: -1 });

        res.render("recruiter-dashboard", {
            title: "Recruiter Dashboard",
            username: req.cookies.username,
            interviews,
            notifications
        });//
    } catch (error) {
        console.error("❌ Error loading recruiter dashboard:", error.message);
        res.status(500).json({ message: "Error loading dashboard" });
    }
});


// // Storage for Video Uploads (if using file uploads)
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads/"); // Save videos in "uploads" folder
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + "-" + file.originalname);
//     }
//   });
//   const upload = multer({ storage });
  
// Render the Create Interview Page with User List
router.get("/create-interview", async (req, res) => {
    try {
      const users = await User.find({ role: "candidate" }); // Fetch all candidates
      res.render("create-interview", { title: "Create Interview", users });
    } catch (error) {
      console.error("❌ Error fetching users:", error.message);
      res.status(500).json({ message: "Error loading users" });
    }
  });
  
// ✅ Handle Creating a New Interview Session (POST Request)
router.post("/create-interview", async (req, res) => {
    const { title, description, scheduled_date, questions, answerTypes, candidateIds } = req.body;
    const recruiterId = req.user.id;
  
    try {
      // Convert questions into structured format
      const formattedQuestions = questions.map((q, index) => ({
        questionText: q,
        answerType: answerTypes[index], // "text" or "video"
      }));
  
      const interview = new Interview({
        recruiterId,
        title,
        description,
        scheduled_date: new Date(scheduled_date), // ✅ Save the scheduled date as a Date object
        questions: formattedQuestions,
        candidates: candidateIds ? candidateIds.map(id => new mongoose.Types.ObjectId(id)) : []
      });
  
      await interview.save();
      res.redirect("/recruiter-dashboard"); // Redirect after saving
    } catch (error) {
      console.error("❌ Error creating interview:", error.message);
      res.status(500).json({ message: "Error creating interview" });
    }
  });
  


module.exports = router;
