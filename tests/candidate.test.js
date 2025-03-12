const request = require("supertest");
const app = require("../server");
const fs = require("fs-extra");
const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/User");

// Use dynamic import() for Chai
let chai;
(async () => {
  chai = await import("chai");
})();
const expect = chai?.expect || (() => { throw new Error("Chai not loaded"); });

let candidateToken = "";
let candidateId = "";
const testEmail = "testcandidate@example.com";
const testPassword = "password123";

describe("Candidate Profile & Resume Management", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Create test candidate
    const candidate = new User({ name: "Test Candidate", email: testEmail, password: testPassword, role: "candidate" });
    await candidate.save();
    candidateId = candidate._id.toString();

    // Login to get token
    const res = await request(app)
      .post("/auth/login")
      .send({ email: testEmail, password: testPassword });
    
    candidateToken = res.headers["set-cookie"];
  });

  after(async () => {
    // Cleanup: Delete test candidate
    await User.findByIdAndDelete(candidateId);
    await mongoose.connection.close();
  });

  it("Should update candidate profile", async () => {
    const res = await request(app)
      .post("/candidate/profile/edit")
      .set("Cookie", candidateToken)
      .send({ name: "Updated Candidate", email: testEmail });

    expect(res.status).to.equal(302);
  });

  it("Should upload a resume", async () => {
    const res = await request(app)
      .post("/candidate/profile/upload-resume")
      .set("Cookie", candidateToken)
      .attach("resume", path.resolve(__dirname, "sample.pdf"));

    expect(res.status).to.equal(302);

    // Verify file exists
    const uploadedFilePath = `uploads/resumes/${candidateId}.pdf`;
    expect(fs.existsSync(uploadedFilePath)).to.be.true;
  });

  it("Should replace an existing resume", async () => {
    const res = await request(app)
      .post("/candidate/profile/upload-resume")
      .set("Cookie", candidateToken)
      .attach("resume", path.resolve(__dirname, "sample2.pdf"));

    expect(res.status).to.equal(302);

    // Verify old file is replaced
    const uploadedFilePath = `uploads/resumes/${candidateId}.pdf`;
    expect(fs.existsSync(uploadedFilePath)).to.be.true;
  });

  it("Should delete the resume", async () => {
    const res = await request(app)
      .post("/candidate/profile/delete-resume")
      .set("Cookie", candidateToken);

    expect(res.status).to.equal(302);

    // Verify file is deleted
    const uploadedFilePath = `uploads/resumes/${candidateId}.pdf`;
    expect(fs.existsSync(uploadedFilePath)).to.be.false;
  });
});
