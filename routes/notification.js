const express = require("express");
const Notification = require("../models/Notification");
const Interview = require("../models/Interview");
const mongoose = require("mongoose");

const router = express.Router();

// Function to check and add notifications for interviews happening tomorrow
const checkUpcomingInterviews = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Start of the day

    const nextDay = new Date(tomorrow);
    nextDay.setHours(23, 59, 59, 999); // End of the day

    // Find interviews scheduled for tomorrow
    const upcomingInterviews = await Interview.find({
      scheduled_date: { $gte: tomorrow, $lte: nextDay }
    }).populate("recruiterId", "name email");

    for (const interview of upcomingInterviews) {
      // Create a notification for the recruiter
      await Notification.create({
        userId: interview.recruiterId._id,
        message: `Reminder: You have an interview titled "${interview.title}" scheduled for tomorrow.`,
        status: "unread",
      });

      // Create a notification for all assigned candidates
      for (const candidateId of interview.candidates) {
        await Notification.create({
          userId: candidateId,
          message: `Reminder: You have an interview titled "${interview.title}" scheduled for tomorrow.`,
          status: "unread",
        });
      }
    }

    console.log(`Notifications sent for ${upcomingInterviews.length} upcoming interviews.`);
  } catch (error) {
    console.error("Error checking upcoming interviews:", error.message);
  }
};

// Run this function every day at midnight
setInterval(checkUpcomingInterviews, 24 * 60 * 60 * 1000); // Run once per day


// View Notification Details
router.get("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).send("Notification not found");

    res.render("notification-details", { title: "Notification Details", notification });
  } catch (error) {
    console.error("Error fetching notification details:", error.message);
    res.status(500).json({ message: "Error fetching notification details" });
  }
});

// Delete Notification
router.post("/:id/delete", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.redirect("/recruiter");
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    res.status(500).json({ message: "Error deleting notification" });
  }
});


module.exports = router;
