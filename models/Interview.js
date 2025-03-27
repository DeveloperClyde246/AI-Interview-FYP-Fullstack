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
      answerType: { type: String, enum: ["text", "file", "recording"], required: true },
    }
  ],
  responses: [
    {
      candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      answers: [String],
      videoMarks: [Number], // ✅ Store individual video marks
      marks: { type: Number, default: null } // ✅ Store average mark
    }
  ],
  createdAt: { type: Date, default: Date.now },
  answerDuration: { type: Number, default: 60 },
});

module.exports = mongoose.model("Interview", InterviewSchema);