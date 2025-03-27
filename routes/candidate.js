const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Interview = require("../models/Interview");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const axios = require("axios");

const router = express.Router();

// Ensure only candidates can access these routes
router.use(authMiddleware(["candidate"]));

// ✅ Candidate Dashboard - Get notifications and interviews
router.get("/", async (req, res) => {
  try {
    const candidateId = new mongoose.Types.ObjectId(req.user.id);

    // Fetch notifications for the candidate
    const notifications = await Notification.find({ userId: candidateId }).sort({
      createdAt: -1,
    });

    // Fetch interviews where the candidate is assigned
    const interviews = await Interview.find({ candidates: candidateId })
      .populate("recruiterId", "name email")
      .sort({ scheduled_date: -1 });

    res.json({ username: req.cookies.username, notifications, interviews });
  } catch (error) {
    console.error("❌ Error loading candidate dashboard:", error.message);
    res.status(500).json({ message: "Error loading dashboard" });
  }
});

// ✅ Get Notification Details
router.get("/notifications/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.json({ notification });
  } catch (error) {
    console.error("❌ Error fetching notification details:", error.message);
    res.status(500).json({ message: "Error fetching notification details" });
  }
});

// ✅ Delete Notification
router.delete("/notifications/:id/delete", async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting notification:", error.message);
    res.status(500).json({ message: "Error deleting notification" });
  }
});

// ✅ Get Candidate Profile
router.get("/profile", async (req, res) => {
  try {
    const candidate = await User.findById(req.user.id);
    res.json({ candidate });
  } catch (error) {
    console.error("❌ Error loading profile:", error.message);
    res.status(500).json({ message: "Error loading profile" });
  }
});

// ✅ Update Candidate Password
router.post("/profile/edit-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const candidate = await User.findById(req.user.id);

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, candidate.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error updating password:", error.message);
    res.status(500).json({ message: "Error updating password" });
  }
});

// ✅ Get Assigned Interviews
router.get("/interviews", async (req, res) => {
  try {
    const candidateId = new mongoose.Types.ObjectId(req.user.id);

    const interviews = await Interview.find({ candidates: candidateId })
      .populate("recruiterId", "name email")
      .sort({ scheduled_date: -1 });

    res.json({ interviews });
  } catch (error) {
    console.error("❌ Error fetching interviews:", error.message);
    res.status(500).json({ message: "Error fetching interviews" });
  }
});

// ✅ Get Interview Details and Questions
router.get("/interview/:id", async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    res.json({ interview });
  } catch (error) {
    console.error("❌ Error fetching interview:", error.message);
    res.status(500).json({ message: "Error fetching interview" });
  }
});

// ✅ Submit Interview Answers
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "interview_responses",
    resource_type: "auto",
    format: async (req, file) => file.mimetype.split("/")[1],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // Allow up to 200MB file uploads
});

router.post("/interview/:id/submit", upload.array("fileAnswers", 5), async (req, res) => {
  try {
    const candidateId = req.user.id;
    let processedAnswers = [];
    let videoURLs = [];

    // ✅ Check if the candidate has already submitted a response
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const existingResponse = interview.responses.find(
      (response) => response.candidate.toString() === candidateId
    );

    if (existingResponse) {
      return res.status(400).json({ message: "You have already submitted answers for this interview." });
    }

    // ✅ Process file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        processedAnswers.push(file.path);
      }
    }

    if (req.body.answers) {
      for (const answer of req.body.answers) {
        processedAnswers.push(answer);
        if (answer.startsWith("http") && answer.includes("video/upload")) {
          videoURLs.push(answer);
        }
      }
    }

    // ✅ Save response with null marks initially
    const newResponse = {
      candidate: candidateId,
      answers: processedAnswers,
      videoMarks: [],
      marks: null,
    };

    interview.responses.push(newResponse);
    await interview.save();

    // ✅ Analyze video responses
    let videoMarks = [];

    for (const url of videoURLs) {
      try {
        const aiRes = await axios.post("http://localhost:5001/analyze-video", { videoURL: url });
        const { marks } = aiRes.data;
        videoMarks.push(marks);
      } catch (err) {
        console.error("❌ AI error:", err.message);
      }
    }

    // ✅ Calculate average mark
    const avgMark = videoMarks.length > 0 ? Math.round(videoMarks.reduce((a, b) => a + b, 0) / videoMarks.length) : null;

    // ✅ Update response with marks
    await Interview.findOneAndUpdate(
      { _id: req.params.id, "responses.candidate": candidateId },
      {
        $set: {
          "responses.$.videoMarks": videoMarks,
          "responses.$.marks": avgMark,
        },
      },
      { new: true }
    );

    res.json({ message: "Answers submitted successfully", avgMark });
  } catch (error) {
    console.error("❌ Error submitting answers:", error.message);
    res.status(500).json({ message: "Error submitting answers" });
  }
});

// ✅ Get FAQ Details
router.get("/faq", (req, res) => {
  res.json({ message: "FAQ Page Loaded" });
});

module.exports = router;
