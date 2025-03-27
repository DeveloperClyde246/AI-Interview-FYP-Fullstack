import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

const RecruiterInterviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [allCandidates, setAllCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [newQuestions, setNewQuestions] = useState([]); // ✅ Store new questions
  const [error, setError] = useState("");

  // Form State for Editable Fields
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduled_date: "",
    answerDuration: 60, // Default to 60 seconds
  });

  // ✅ Fetch interview details
  const fetchDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/recruiter/interview/${id}`, {
        withCredentials: true,
      });
      setInterview(res.data.interview);
      setAllCandidates(res.data.allCandidates);
      // Pre-fill the form with interview details
      setForm({
        title: res.data.interview.title,
        description: res.data.interview.description,
        scheduled_date: res.data.interview.scheduled_date.slice(0, 16), // Format for datetime-local
        answerDuration: res.data.interview.answerDuration || 60,
      });
    } catch (err) {
      setError("Failed to load interview details.");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // ✅ Handle unassigning candidates
  const handleUnassign = async (candidateId) => {
    try {
      await axios.post(
        `http://localhost:5000/recruiter/interview/${id}/unassign-candidate`,
        { candidateId },
        { withCredentials: true }
      );
      fetchDetails();
    } catch (err) {
      setError("Unassign failed.");
    }
  };

  // ✅ Handle adding candidates
  const handleAddCandidates = async () => {
    try {
      await axios.post(
        `http://localhost:5000/recruiter/interview/${id}/add-candidates`,
        { candidateIds: selectedCandidates },
        { withCredentials: true }
      );
      setSelectedCandidates([]);
      fetchDetails();
    } catch (err) {
      setError("Add candidates failed.");
    }
  };

  // ✅ Handle form submission to update interview details
  const handleEditInterview = async (e) => {
    e.preventDefault();

    try {
      const formEl = e.target;
      const updatedQuestions = Array.from(formEl.elements)
        .filter((el) => el.name === "questions[]")
        .map((el, i) => ({
          questionText: el.value,
          answerType: formEl.elements[`answerTypes[]`][i].value,
        }));

      // Combine new questions with updated existing questions
      const allQuestions = [
        ...updatedQuestions,
        ...newQuestions,
      ];

      await axios.post(
        `http://localhost:5000/recruiter/interview/${id}/edit`,
        {
          title: form.title,
          description: form.description,
          scheduled_date: form.scheduled_date,
          answerDuration: form.answerDuration,
          questions: allQuestions.map((q) => q.questionText),
          answerTypes: allQuestions.map((q) => q.answerType),
        },
        { withCredentials: true }
      );
      navigate("/recruiter/interviews"); // Redirect after update
    } catch (err) {
      setError("Failed to update interview.");
    }
  };

  // ✅ Handle new questions addition
  const handleAddNewQuestion = () => {
    setNewQuestions([
      ...newQuestions,
      { questionText: "", answerType: "text" },
    ]);
  };

  const handleNewQuestionChange = (index, key, value) => {
    const updatedQuestions = [...newQuestions];
    updatedQuestions[index][key] = value;
    setNewQuestions(updatedQuestions);
  };

  // ✅ Handle input changes for title, description, scheduled date, and duration
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle toggling candidates selection
  const toggleCandidate = (candidateId) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  if (!interview) return <p>Loading...</p>;

  // ✅ Get unassigned candidates
  const unassigned = allCandidates.filter(
    (c) => !interview.candidates.some((i) => i._id === c._id)
  );

  // ✅ Get current datetime in the correct format for datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div>
      <h2>Edit Interview Details</h2>

      <form onSubmit={handleEditInterview}>
        {/* ✅ Editable Fields */}
        <label>Interview Title:</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleInputChange}
          required
        />
        <br />

        <label>Interview Description:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleInputChange}
          required
        />
        <br />

        <label>Scheduled Date:</label>
        <input
          type="datetime-local"
          name="scheduled_date"
          value={form.scheduled_date}
          onChange={handleInputChange}
          min={getCurrentDateTime()} 
          required
        />
        <br />

        <label>Answer Duration (seconds):</label>
        <input
          type="number"
          name="answerDuration"
          value={form.answerDuration}
          onChange={handleInputChange}
          min="10"
          required
        />
        <br />

        {/* ✅ Edit Questions */}
        <h3>Edit Existing Questions</h3>
        <div id="questions-container">
          {interview.questions.map((q, i) => (
            <div key={i} className="question">
              <input
                type="text"
                name="questions[]"
                defaultValue={q.questionText}
                required
              />
              <select name="answerTypes[]">
                <option value="text" selected={q.answerType === "text"}>
                  Text
                </option>
                <option value="file" selected={q.answerType === "file"}>
                  File
                </option>
                <option value="recording" selected={q.answerType === "recording"}>
                  Recording
                </option>
              </select>
            </div>
          ))}

          {/* ✅ Add New Questions Section */}
          {newQuestions.map((q, index) => (
            <div key={`new-${index}`} className="question">
              <input
                type="text"
                value={q.questionText}
                onChange={(e) =>
                  handleNewQuestionChange(index, "questionText", e.target.value)
                }
                placeholder="Enter new question"
                required
              />
              <select
                value={q.answerType}
                onChange={(e) =>
                  handleNewQuestionChange(index, "answerType", e.target.value)
                }
              >
                <option value="text">Text</option>
                <option value="file">File</option>
                <option value="recording">Recording</option>
              </select>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleAddNewQuestion}>
          ➕ Add Another Question
        </button>

        <button type="submit">Save Changes</button>
      </form>

      {/* ✅ Assign or Unassign Candidates */}
      <h3>Assigned Candidates</h3>
      <ul>
        {interview.candidates.length > 0 ? (
          interview.candidates.map((c) => (
            <li key={c._id}>
              {c.name} ({c.email})
              <button onClick={() => handleUnassign(c._id)}>Unassign</button>
            </li>
          ))
        ) : (
          <p>No candidate assigned.</p>
        )}
      </ul>

      <h3>Add More Candidates</h3>
      {unassigned.length === 0 ? (
        <p>All users are already assigned.</p>
      ) : (
        <>
          {unassigned.map((c) => (
            <div key={c._id}>
              <input
                type="checkbox"
                checked={selectedCandidates.includes(c._id)}
                onChange={() => toggleCandidate(c._id)}
              />
              {c.name} ({c.email})
            </div>
          ))}
          <button onClick={handleAddCandidates}>Add Selected Candidates</button>
        </>
      )}

      <br />
      <Link to="/recruiter/interviews">Back to Interviews</Link>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default RecruiterInterviewDetails;
