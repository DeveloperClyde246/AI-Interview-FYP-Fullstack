const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scheduled_date: { type: Date, required: true },
  status: { type: String, enum: ["scheduled", "completed"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Interview", InterviewSchema);
