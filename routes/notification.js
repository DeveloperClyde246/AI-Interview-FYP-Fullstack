const express = require("express");
const Notification = require("../models/Notification");
const Interview = require("../models/Interview");
const mongoose = require("mongoose");

const router = express.Router();

// ✅ Check and add notifications for interviews happening tomorrow
const checkUpcomingInterviews = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setHours(23, 59, 59, 999);

    const upcomingInterviews = await Interview.find({
      scheduled_date: { $gte: tomorrow, $lte: nextDay },
    }).populate("recruiterId", "name email");

    for (const interview of upcomingInterviews) {
      await Notification.create({
        userId: interview.recruiterId._id,
        message: `Reminder: You have an interview titled "${interview.title}" scheduled for tomorrow.`,
        status: "unread",
      });

      for (const candidateId of interview.candidates) {
        await Notification.create({
          userId: candidateId,
          message: `Reminder: You have an interview titled "${interview.title}" scheduled for tomorrow.`,
          status: "unread",
        });
      }
    }

    console.log(
      `✅ Notifications sent for ${upcomingInterviews.length} upcoming interviews.`
    );
  } catch (error) {
    console.error("❌ Error checking upcoming interviews:", error.message);
  }
};

setInterval(checkUpcomingInterviews, 24 * 60 * 60 * 1000);

// ✅ Get notification details
router.get("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.json({ notification });
  } catch (error) {
    console.error("❌ Error fetching notification details:", error.message);
    res.status(500).json({ message: "Error fetching notification details" });
  }
});

// ✅ Delete Notification (Prevent deletion if interview is within 24 hours)
router.post("/:id/delete", async (req, res) => {
  try {
    // ✅ Find the notification
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // ✅ Check if the notification is linked to an interview
    const interviewTitleMatch = notification.message.match(/interview titled "(.*)" scheduled/);
    if (interviewTitleMatch) {
      const interviewTitle = interviewTitleMatch[1];

      // ✅ Find the interview with the title mentioned in the notification
      const interview = await Interview.findOne({ title: interviewTitle });
      if (interview) {
        const now = new Date();
        const interviewTime = new Date(interview.scheduled_date);

        // ✅ Check if the interview is within the next 24 hours
        const timeDiff = interviewTime - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        // ❌ Prevent deletion if the interview is happening in less than 24 hours
        if (hoursDiff > 0 && hoursDiff <= 24) {
          return res.status(403).json({
            message: "Cannot delete notifications for interviews scheduled within 24 hours.",
          });
        }
      }
    }

    // ✅ Allow notification deletion if interview has passed or not happening within 24 hours
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting notification:", error.message);
    res.status(500).json({ message: "Error deleting notification" });
  }
});

module.exports = router;
