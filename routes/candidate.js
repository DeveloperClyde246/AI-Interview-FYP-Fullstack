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


//Interviews------------------------------------
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

router.post("/interview/:id/submit", upload.array("fileAnswers", 5), async (req, res) => {
  try {
    const candidateId = req.user.id;
    let processedAnswers = [];
    let videoURL = "";

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

    // ✅ Debugging: Log received data
    console.log("📩 Received Answers:", req.body.answers);
    console.log("📁 Received Files:", req.files);

    // ✅ Process File Uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        console.log("⬆ Uploading file to Cloudinary:", file.originalname);
        const uploadResponse = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "interview_responses"
        });
        console.log("✅ File Uploaded:", uploadResponse.secure_url);
        processedAnswers.push(uploadResponse.secure_url);
      }
    }

    let videoURLs = [];

    if (req.body.answers) {
      for (const answer of req.body.answers) {
        if (answer.startsWith("http") && answer.includes("video/upload")) {
          videoURLs.push(answer); // ✅ Save all video URLs
          processedAnswers.push(answer);
        } else {
          processedAnswers.push(answer);
        }
      }
    }
    
    // ✅ Save initial response first with null marks
    const newResponse = {
      candidate: candidateId,
      answers: processedAnswers,
      videoMarks: [],
      marks: null
    };
    interview.responses.push(newResponse);
    await interview.save();
    
    // ✅ Analyze each video and calculate average
    let videoMarks = [];
    
    for (const url of videoURLs) {
      try {
        const aiRes = await axios.post("http://localhost:5001/analyze-video", { videoURL: url });
        const { marks } = aiRes.data;
        videoMarks.push(marks);
        console.log(`✅ Video analyzed: ${url} → ${marks}`);
      } catch (err) {
        console.error("❌ AI error:", err.message);
      }
    }
    
    const avgMark = videoMarks.length > 0
      ? Math.round(videoMarks.reduce((a, b) => a + b, 0) / videoMarks.length)
      : null;
    
    // ✅ Update response in DB
    const updatedInterview = await Interview.findOneAndUpdate(
      { _id: req.params.id, "responses.candidate": candidateId },
      { $set: {
          "responses.$.videoMarks": videoMarks,
          "responses.$.marks": avgMark
        }
      },
      { new: true }
    );
    
    if (updatedInterview) {
      console.log("✅ Final average mark:", avgMark);
      console.log("📊 All marks:", videoMarks);
    }

    res.redirect("/candidate/interviews");
  } catch (error) {
    console.error("❌ Error submitting answers:", error.message);
    res.status(500).json({ message: "Error submitting answers" });
  }
});



//FAQ------------------------------------
router.get("/faq", (req, res) => {
  res.render("candidate-faq", { title: "FAQ" });
});
  

module.exports = router;
