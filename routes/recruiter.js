const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const Interview = require("../models/Interview");
const User = require("../models/User");
//const multer = require("multer");
const mongoose = require("mongoose");

const router = express.Router();

// Ensure only recruiters can access these routes
router.use(authMiddleware(["recruiter"]));

// Recruiter Dashboard
router.get("/", async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // Check for interviews scheduled within the next 24 hours
    const now = new Date();
    const nextDay = new Date();
    nextDay.setHours(now.getHours() + 24); // 24 hours from now

    const upcomingInterviews = await Interview.find({
      recruiterId,
      scheduled_date: { $gte: now, $lte: nextDay }
    }).populate("candidates", "_id");

    let notificationsAdded = 0;

    for (const interview of upcomingInterviews) {
      // Check if a notification already exists
      const existingNotification = await Notification.findOne({
        userId: recruiterId,
        message: `Reminder: You have an interview titled "${interview.title}" scheduled soon.`
      });

      if (!existingNotification) {
        await Notification.create({
          userId: recruiterId,
          message: `Reminder: You have an interview titled "${interview.title}" scheduled soon.`,
          status: "unread",
        });
        notificationsAdded++;
      }

      // Notify all assigned candidates
      for (const candidate of interview.candidates) {
        const candidateNotification = await Notification.findOne({
          userId: candidate._id,
          message: `Reminder: You have an interview titled "${interview.title}" scheduled soon.`,
        });

        if (!candidateNotification) {
          await Notification.create({
            userId: candidate._id,
            message: `Reminder: You have an interview titled "${interview.title}" scheduled soon.`,
            status: "unread",
          });
          notificationsAdded++;
        }
      }
    }

    // Fetch notifications after checking for new ones
    const notifications = await Notification.find({ userId: recruiterId }).sort({ createdAt: -1 });

    // Fetch interviews assigned to this recruiter
    const interviews = await Interview.find({ recruiterId })
      .populate("candidates", "name email")
      .sort({ scheduled_date: -1 });

    res.render("recruiter", {
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
  const { title, description, scheduled_date, questions, answerTypes, recordingRequired, candidateIds } = req.body;
  const recruiterId = req.user.id;

  try {
    // Convert questions into structured format
    const formattedQuestions = questions.map((q, index) => ({
      questionText: q,
      answerType: answerTypes[index], // "text", "video", or "recording"
      recordingRequired: recordingRequired ? recordingRequired[index] === "true" : false
    }));

    const interview = new Interview({
      recruiterId,
      title,
      description,
      scheduled_date: new Date(scheduled_date),
      questions: formattedQuestions,
      candidates: candidateIds ? candidateIds.map(id => new mongoose.Types.ObjectId(id)) : []
    });

    await interview.save();
    res.redirect("/recruiter");
  } catch (error) {
    console.error("❌ Error creating interview:", error.message);
    res.status(500).json({ message: "Error creating interview" });
  }
});

  
// ✅ View All Interviews Managed by the Recruiter
router.get("/interviews", async (req, res) => {
    try {
      const recruiterId = new mongoose.Types.ObjectId(req.user.id);
      const interviews = await Interview.find({ recruiterId })
        .populate("candidates", "name email")
        .sort({ scheduled_date: -1 });
  
      res.render("recruiter-interviews", { title: "My Interviews", interviews });
    } catch (error) {
      console.error("❌ Error loading interviews:", error.message);
      res.status(500).json({ message: "Error loading interviews" });
    }
  });
  
// ✅ View Interview Details
router.get("/interview/:id", async (req, res) => {
try {
    const interview = await Interview.findById(req.params.id).populate("candidates", "name email");
    if (!interview) return res.status(404).send("Interview not found");

    const allCandidates = await User.find({ role: "candidate" });
    res.render("recruiter-interview-details", { title: "Interview Details", interview, allCandidates });
} catch (error) {
    console.error("❌ Error fetching interview details:", error.message);
    res.status(500).json({ message: "Error fetching interview details" });
}
});

// ✅ Add More Candidates to an Interview
router.post("/interview/:id/add-candidates", async (req, res) => {
  try {
    const { candidateIds } = req.body;
    if (!candidateIds || candidateIds.length === 0) {
      return res.redirect(`/recruiter/interview/${req.params.id}`);
    }

    await Interview.findByIdAndUpdate(req.params.id, {
      $addToSet: { candidates: { $each: candidateIds.map(id => new mongoose.Types.ObjectId(id)) } }
    });

    res.redirect(`/recruiter/interview/${req.params.id}`);
  } catch (error) {
    console.error("❌ Error adding candidates:", error.message);
    res.status(500).json({ message: "Error adding candidates" });
  }
});

// ✅ Delete an Interview
router.post("/interview/:id/delete", async (req, res) => {
try {
    await Interview.findByIdAndDelete(req.params.id);
    res.redirect("/recruiter/interviews");
} catch (error) {
    console.error("❌ Error deleting interview:", error.message);
    res.status(500).json({ message: "Error deleting interview" });
}
});

router.post("/interview/:id/unassign-candidate", async (req, res) => {
    try {
      const { candidateId } = req.body;
      await Interview.findByIdAndUpdate(req.params.id, {
        $pull: { candidates: new mongoose.Types.ObjectId(candidateId) }
      });
  
      res.redirect(`/recruiter/interview/${req.params.id}`);
    } catch (error) {
      console.error("❌ Error unassigning candidate:", error.message);
      res.status(500).json({ message: "Error unassigning candidate" });
    }
});
  

router.post("/interview/:id/edit", async (req, res) => {
  try {
    const { questions, answerTypes } = req.body;

    // ✅ Convert questions into structured format
    const formattedQuestions = questions.map((q, index) => ({
      questionText: q,
      answerType: answerTypes[index], // "text", "video", or "recording"
    }));

    await Interview.findByIdAndUpdate(req.params.id, { questions: formattedQuestions });

    res.redirect(`/recruiter/interview/${req.params.id}`);
  } catch (error) {
    console.error("❌ Error updating interview:", error.message);
    res.status(500).json({ message: "Error updating interview" });
  }
});

// ✅ Show candidate analysis results for recruiter interviews
router.get("/interview-results", authMiddleware(["recruiter"]), async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const interviews = await Interview.find({ recruiterId })
      .populate("responses.candidate", "name email")
      .sort({ createdAt: -1 });

    res.render("recruiter-interview-results", {
      title: "Interview Results",
      interviews,
    });
  } catch (error) {
    console.error("❌ Error loading interview results:", error.message);
    res.status(500).send("Error loading results");
  }
});




module.exports = router;
