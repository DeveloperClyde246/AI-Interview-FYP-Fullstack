const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  scheduled_date: { type: Date, required: true }, // ✅ Fix: Ensure scheduled_date is a Date
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Store selected candidates
  questions: [
    {
      questionText: String,
      answerType: { type: String, enum: ["text", "video"], required: true },
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Interview", InterviewSchema);
