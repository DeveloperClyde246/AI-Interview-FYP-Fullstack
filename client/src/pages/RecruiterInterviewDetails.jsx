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

  const fetchDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/recruiter/interview/${id}`, {
        withCredentials: true,
      });
      setInterview(res.data.interview);
      setAllCandidates(res.data.allCandidates);
    } catch (err) {
      setError("Failed to load interview details.");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

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

  const handleEditInterview = async (e) => {
    e.preventDefault();

    try {
      const form = e.target;
      const updatedQuestions = Array.from(form.elements)
        .filter((el) => el.name === "questions[]")
        .map((el, i) => ({
          questionText: el.value,
          answerType: form.elements[`answerTypes[]`][i].value,
        }));

      // ✅ Combine existing questions with new questions
      const combinedQuestions = [
        ...updatedQuestions,
        ...newQuestions.map((q) => ({
          questionText: q.questionText,
          answerType: q.answerType,
        })),
      ];

      await axios.post(
        `http://localhost:5000/recruiter/interview/${id}/edit`,
        {
          questions: combinedQuestions.map((q) => q.questionText),
          answerTypes: combinedQuestions.map((q) => q.answerType),
        },
        { withCredentials: true }
      );

      // ✅ Reset new questions and refetch details
      setNewQuestions([]);
      fetchDetails();
    } catch (err) {
      setError("Failed to update interview.");
    }
  };

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

  const toggleCandidate = (candidateId) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  if (!interview) return <p>Loading...</p>;

  const unassigned = allCandidates.filter(
    (c) => !interview.candidates.some((i) => i._id === c._id)
  );

  return (
    <div>
      <h2>Interview Details</h2>
      <p><strong>Title:</strong> {interview.title}</p>
      <p><strong>Description:</strong> {interview.description}</p>
      <p><strong>Scheduled Date:</strong> {new Date(interview.scheduled_date).toLocaleString()}</p>

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

      <h3>Edit Interview Questions</h3>
      <form onSubmit={handleEditInterview}>
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
                <option value="text" selected={q.answerType === "text"}>Text</option>
                <option value="file" selected={q.answerType === "file"}>File</option>
                <option value="recording" selected={q.answerType === "recording"}>Recording</option>
              </select>
            </div>
          ))}

          {/* ✅ New Questions Section */}
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

      <br />
      <Link to="/recruiter/interviews">Back to Interviews</Link>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default RecruiterInterviewDetails;
