const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  scheduled_date: { type: Date, required: true },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  questions: [
    {
      questionText: String,
      answerType: { type: String, enum: ["text", "video", "recording"], required: true }, // ✅ Added "recording"
      recordingRequired: { type: Boolean, default: false } // ✅ Indicates if recording is required
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Interview", InterviewSchema);
