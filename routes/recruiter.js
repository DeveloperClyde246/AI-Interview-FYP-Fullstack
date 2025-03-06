const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const Interview = require("../models/Interview");

const router = express.Router();

// Ensure only recruiters can access these routes
router.use(authMiddleware(["recruiter"]));

// Recruiter Dashboard
router.get("/", async (req, res) => {
  try {
    const recruiterId = req.user.id; // Get recruiter ID from JWT

    // Fetch notifications for this recruiter
    const notifications =await Notification.find({ userId: "67c80e2255dd45082cecb430" });
    //.sort({ createdAt: -1 });

    // Fetch interviews assigned to this recruiter
    const interviews = await Interview.find({ recruiterId })
      .populate("candidateId", "name email") // Get candidate details
      .sort({ scheduled_date: -1 });

    res.render("recruiter-dashboard", {
      title: "Recruiter Dashboard",
      username: req.cookies.username,
      notifications,
      interviews
    });
  } catch (error) {
    console.error("❌ Error loading recruiter dashboard:", error.message);
    res.status(500).json({ message: "Error loading dashboard" });
  }
});

module.exports = router;
