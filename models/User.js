const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "candidate", "recruiter"], 
    required: true 
  },
  interviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interview" }], // References interviews
  resume: { type: String, default: null }, //Store resume file path
  createdAt: { type: Date, default: Date.now }, // Timestamp for user creation
  updatedAt: { type: Date, default: Date.now }  // Timestamp for updates
});

module.exports = mongoose.model("User", UserSchema);
