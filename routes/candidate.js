const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Interview = require("../models/Interview");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const router = express.Router();

// Ensure only candidates can access this page
router.use(authMiddleware(["candidate"]));

// ✅ Candidate Main Page
router.get("/", async (req, res) => {
  try {
    const candidateId = new mongoose.Types.ObjectId(req.user.id);

    // Fetch notifications for the candidate
    const notifications = await Notification.find({ userId: candidateId }).sort({ createdAt: -1 });

    // Fetch interviews where the candidate is assigned
    const interviews = await Interview.find({ candidates: candidateId })
      .populate("recruiterId", "name email")
      .sort({ scheduled_date: -1 });

    res.render("candidate-dashboard", {
      title: "Candidate Dashboard",
      username: req.cookies.username,
      notifications,
      interviews
    });
  } catch (error) {
    console.error("❌ Error loading candidate dashboard:", error.message);
    res.status(500).json({ message: "Error loading dashboard" });
  }
});

// ✅ View Notification Details
router.get("/notifications/:id", async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) return res.status(404).send("Notification not found");
  
      res.render("candidate-notification-details", { title: "Notification Details", notification });
    } catch (error) {
      console.error("❌ Error fetching notification details:", error.message);
      res.status(500).json({ message: "Error fetching notification details" });
    }
  });
  
// ✅ Delete Notification
router.post("/notifications/:id/delete", async (req, res) => {
try {
    await Notification.findByIdAndDelete(req.params.id);
    res.redirect("/candidate");
} catch (error) {
    console.error("❌ Error deleting notification:", error.message);
    res.status(500).json({ message: "Error deleting notification" });
}
});

module.exports = router;
