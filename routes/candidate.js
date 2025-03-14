const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Interview = require("../models/Interview");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const User = require("../models/User");
const path = require("path");

const bcrypt = require("bcryptjs");

const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const axios = require("axios");


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




//Notifications------------------------------------
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

//Profile------------------------------------
// // ✅ Set Up Multer for Resume Upload
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads/resumes/"); // ✅ Save resumes in "uploads/resumes/"
//     },
//     filename: (req, file, cb) => {
//       cb(null, req.user.id + path.extname(file.originalname)); // ✅ Use candidate ID as filename
//     }
//   });
//   const upload = multer({ storage });
  
// ✅ Render Candidate Profile Page
router.get("/profile", async (req, res) => {
    try {
      const candidate = await User.findById(req.user.id);
      res.render("candidate-profile", { title: "Edit Profile", candidate });
    } catch (error) {
      console.error("❌ Error loading profile:", error.message);
      res.status(500).json({ message: "Error loading profile" });
    }
  });
  

  // ✅ Handle Password Update
router.post("/profile/edit-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const candidate = await User.findById(req.user.id);

    // ✅ Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, candidate.password);
    if (!isMatch) {
      return res.render("candidate-profile", { title: "Edit Profile", candidate, errorMessage: "Incorrect current password." });
    }

    // ✅ Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.redirect("/candidate/profile");
  } catch (error) {
    console.error("❌ Error updating password:", error.message);
    res.status(500).json({ message: "Error updating password" });
  }
});
  // // ✅ Handle Resume Upload & Replace Existing One
  // router.post("/profile/upload-resume", upload.single("resume"), async (req, res) => {
  //   try {
  //     const candidate = await User.findById(req.user.id);
  
  //     // If an old resume exists, delete it
  //     if (candidate.resume) {
  //       const oldResumePath = path.join(__dirname, "..", candidate.resume);
  //       if (fs.existsSync(oldResumePath)) {
  //         fs.unlinkSync(oldResumePath);
  //       }
  //     }
  
  //     // Save new resume path
  //     await User.findByIdAndUpdate(req.user.id, { resume: `/uploads/resumes/${req.file.filename}` });
  //     res.redirect("/candidate/profile");
  //   } catch (error) {
  //     console.error("❌ Error uploading resume:", error.message);
  //     res.status(500).json({ message: "Error uploading resume" });
  //   }
  // });
  
  // // ✅ Handle Resume Deletion
  // router.post("/profile/delete-resume", async (req, res) => {
  //   try {
  //     const candidate = await User.findById(req.user.id);
  
  //     if (candidate.resume) {
  //       const resumePath = path.join(__dirname, "..", candidate.resume);
  //       if (fs.existsSync(resumePath)) {
  //         fs.unlinkSync(resumePath); // ✅ Delete file from server
  //       }
  
  //       await User.findByIdAndUpdate(req.user.id, { resume: null }); // ✅ Remove from DB
  //     }
  
  //     res.redirect("/candidate/profile");
  //   } catch (error) {
  //     console.error("❌ Error deleting resume:", error.message);
  //     res.status(500).json({ message: "Error deleting resume" });
  //   }
  // });

// ✅ View Assigned Interviews
router.get("/interviews", async (req, res) => {
  try {
    const candidateId = new mongoose.Types.ObjectId(req.user.id);
    
    const interviews = await Interview.find({ candidates: candidateId })
      .populate("recruiterId", "name email")
      .sort({ scheduled_date: -1 });

    res.render("candidate-interviews", { title: "My Interviews", interviews });
  } catch (error) {
    console.error("❌ Error fetching interviews:", error.message);
    res.status(500).json({ message: "Error fetching interviews" });
  }
});

// ✅ View Interview Questions & Answer Form
router.get("/interview/:id", async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).send("Interview not found");

    res.render("candidate-answer", { title: "Answer Questions", interview });
  } catch (error) {
    console.error("❌ Error fetching interview:", error.message);
    res.status(500).json({ message: "Error fetching interview" });
  }
});



// ✅ Multer Storage for File Uploads (Manual Uploads)
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
  limits: { fileSize: 200 * 1024 * 1024 }, // ✅ Allow up to 200MB file uploads
});

router.post("/interview/:id/submit", multer().array("fileAnswers", 5), async (req, res) => {
  try {
    const candidateId = req.user.id;
    let processedAnswers = [];

    // ✅ Process File Uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        processedAnswers.push(file.path); // ✅ Store Cloudinary URL for uploaded files
      });
    }

    // ✅ Process Cloudinary Video URL Instead of Base64
    let videoURL = "";
    if (req.body.answers) {
      for (const answer of req.body.answers) {
        if (answer.startsWith("http")) {
          videoURL = answer; // ✅ Store Cloudinary Video URL
          processedAnswers.push(answer);
        } else {
          processedAnswers.push(answer); // ✅ Store text-based answers directly
        }
      }
    }

    // ✅ Store Responses in Database
    const interview = await Interview.findByIdAndUpdate(req.params.id, {
      $push: { responses: { candidate: candidateId, answers: processedAnswers } }
    }, { new: true });

    // ✅ Send Video to AI Analysis (if a video response exists)
    if (videoURL) {
      const aiResponse = await axios.post("http://localhost:5001/analyze-video", { videoURL });
      const { marks } = aiResponse.data; // ✅ AI returns marks

      // ✅ Save marks into the database
      interview.responses.forEach(response => {
        if (response.candidate.toString() === candidateId) {
          response.marks = marks; // ✅ Attach AI-generated marks
        }
      });

      await interview.save();
    }

    res.redirect("/candidate/interviews");
  } catch (error) {
    console.error("❌ Error submitting answers:", error.message);
    res.status(500).json({ message: "Error submitting answers" });
  }
});




router.get("/faq", (req, res) => {
  res.render("candidate-faq", { title: "FAQ" });
});
  

module.exports = router;
