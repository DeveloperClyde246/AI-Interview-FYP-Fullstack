const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const Interview = require("../models/Interview");
const User = require("../models/User");
const mongoose = require("mongoose");

const router = express.Router();

// Ensure only recruiters can access these routes
router.use(authMiddleware(["recruiter"]));

// ✅ Recruiter Dashboard (GET all notifications + interviews)
router.get("/", async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const now = new Date();
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

    const upcomingInterviews = await Interview.find({
      recruiterId,
      scheduled_date: { $gte: now, $lte: nextDay },
    }).populate("candidates", "_id");

    for (const interview of upcomingInterviews) {
      const recruiterMsg = `Reminder: You have an interview titled "${interview.title}" scheduled soon.`;

      const recruiterNotification = await Notification.findOne({
        userId: recruiterId,
        message: recruiterMsg,
      });

      if (!recruiterNotification) {
        await Notification.create({
          userId: recruiterId,
          message: recruiterMsg,
          status: "unread",
        });
      }

      for (const candidate of interview.candidates) {
        const candidateMsg = `Reminder: You have an interview titled "${interview.title}" scheduled soon.`;

        const existing = await Notification.findOne({
          userId: candidate._id,
          message: candidateMsg,
        });

        if (!existing) {
          await Notification.create({
            userId: candidate._id,
            message: candidateMsg,
            status: "unread",
          });
        }
      }
    }

    const notifications = await Notification.find({ userId: recruiterId }).sort({ createdAt: -1 });

    const interviews = await Interview.find({ recruiterId })
      .populate("candidates", "name email")
      .sort({ scheduled_date: -1 });

    res.json({
      username: req.cookies.username,
      notifications,
      interviews,
    });
  } catch (error) {
    console.error("❌ Error loading recruiter dashboard:", error.message);
    res.status(500).json({ message: "Error loading dashboard" });
  }
});

// ✅ Fetch candidates for create-interview page
router.get("/create-interview", async (req, res) => {
  try {
    const users = await User.find({ role: "candidate" });
    res.json({ candidates: users });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ message: "Error loading users" });
  }
});

// ✅ Create new interview
router.post("/create-interview", async (req, res) => {
  const { title, description, scheduled_date, questions, candidateIds } = req.body;
  const recruiterId = req.user.id;

  try {
    // ✅ Validate if questions is an array of objects
    if (!Array.isArray(questions) || questions.some(q => typeof q !== "object" || !q.questionText)) {
      return res.status(400).json({ message: "Invalid questions format" });
    }

    // ✅ Map questions correctly
    const formattedQuestions = questions.map((q) => ({
      questionText: q.questionText,
      answerType: q.answerType || "text", // Default answer type if not provided
      recordingRequired: q.recordingRequired || false,
    }));

    // ✅ Create new interview with formatted questions
    const interview = new Interview({
      recruiterId,
      title,
      description,
      scheduled_date: new Date(scheduled_date),
      questions: formattedQuestions,
      candidates: candidateIds ? candidateIds.map(id => new mongoose.Types.ObjectId(id)) : [],
    });

    await interview.save();
    res.status(201).json({ message: "Interview created successfully" });
  } catch (error) {
    console.error("❌ Error creating interview:", error.message);
    res.status(500).json({ message: "Error creating interview" });
  }
});

// ✅ Get all interviews for this recruiter
router.get("/interviews", async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const interviews = await Interview.find({ recruiterId })
      .populate("candidates", "name email")
      .sort({ scheduled_date: -1 });

    res.json({ interviews });
  } catch (error) {
    console.error("❌ Error loading interviews:", error.message);
    res.status(500).json({ message: "Error loading interviews" });
  }
});

// ✅ Get a single interview
router.get("/interview/:id", async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate("candidates", "name email");
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const allCandidates = await User.find({ role: "candidate" });
    res.json({ interview, allCandidates });
  } catch (error) {
    console.error("❌ Error fetching interview details:", error.message);
    res.status(500).json({ message: "Error fetching interview details" });
  }
});

// ✅ Add candidates to interview
router.post("/interview/:id/add-candidates", async (req, res) => {
  try {
    const { candidateIds } = req.body;
    if (!candidateIds || candidateIds.length === 0) {
      return res.status(400).json({ message: "No candidates provided" });
    }

    await Interview.findByIdAndUpdate(req.params.id, {
      $addToSet: { candidates: { $each: candidateIds.map(id => new mongoose.Types.ObjectId(id)) } }
    });

    res.json({ message: "Candidates added" });
  } catch (error) {
    console.error("❌ Error adding candidates:", error.message);
    res.status(500).json({ message: "Error adding candidates" });
  }
});

// ✅ Delete interview
router.post("/interview/:id/delete", async (req, res) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ message: "Interview deleted" });
  } catch (error) {
    console.error("❌ Error deleting interview:", error.message);
    res.status(500).json({ message: "Error deleting interview" });
  }
});

// ✅ Unassign candidate
router.post("/interview/:id/unassign-candidate", async (req, res) => {
  try {
    const { candidateId } = req.body;
    await Interview.findByIdAndUpdate(req.params.id, {
      $pull: { candidates: new mongoose.Types.ObjectId(candidateId) }
    });

    res.json({ message: "Candidate unassigned" });
  } catch (error) {
    console.error("❌ Error unassigning candidate:", error.message);
    res.status(500).json({ message: "Error unassigning candidate" });
  }
});

// ✅ Edit interview questions
router.post("/interview/:id/edit", async (req, res) => {
  try {
    const { questions, answerTypes } = req.body;

    const formattedQuestions = questions.map((q, index) => ({
      questionText: q,
      answerType: answerTypes[index],
    }));

    await Interview.findByIdAndUpdate(req.params.id, { questions: formattedQuestions });

    res.json({ message: "Interview updated" });
  } catch (error) {
    console.error("❌ Error updating interview:", error.message);
    res.status(500).json({ message: "Error updating interview" });
  }
});

// ✅ View AI analysis results
router.get("/interview-results", async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const interviews = await Interview.find({ recruiterId })
      .populate("responses.candidate", "name email")
      .sort({ createdAt: -1 });

    res.json({ interviews });
  } catch (error) {
    console.error("❌ Error loading interview results:", error.message);
    res.status(500).json({ message: "Error loading results" });
  }
});

module.exports = router;
