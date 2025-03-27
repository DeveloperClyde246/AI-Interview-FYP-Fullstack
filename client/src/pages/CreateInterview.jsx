import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateInterview = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [questions, setQuestions] = useState([
    { questionText: "", answerType: "text", recordingRequired: false },
  ]);
  const navigate = useNavigate();

  // ✅ Fetch candidates when component loads
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/recruiter/create-interview",
          {
            withCredentials: true,
          }
        );
        setCandidates(res.data.candidates);
      } catch (err) {
        console.error("Error fetching candidates:", err);
      }
    };

    fetchCandidates();
  }, []);

  // ✅ Handle creating interview (UPDATED)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate that at least one question is provided
    if (questions.length === 0 || !questions[0].questionText) {
      alert("Please add at least one question.");
      return;
    }

    // ✅ Validate scheduled date
    if (!scheduledDate) {
      alert("Please provide a scheduled date.");
      return;
    }

    // ✅ Prepare the payload correctly
    const formattedQuestions = questions.map((q) => ({
      questionText: q.questionText,
      answerType: q.answerType || "text", // Default to "text" if not provided
      recordingRequired: q.recordingRequired || false,
    }));

    try {
      const res = await axios.post(
        "http://localhost:5000/recruiter/create-interview",
        {
          title,
          description,
          scheduled_date: scheduledDate,
          questions: formattedQuestions, // ✅ Pass questions as objects
          candidateIds: selectedCandidates,
        },
        { withCredentials: true }
      );

      if (res.status === 201) {
        alert("Interview created successfully!");
        navigate("/recruiter/interviews");
      }
    } catch (err) {
      console.error("Error creating interview:", err);
      alert("Failed to create interview.");
    }
  };

  // ✅ Add a new question dynamically
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", answerType: "text", recordingRequired: false },
    ]);
  };

  // ✅ Handle question updates
  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  return (
    <div>
      <h2>Create New Interview</h2>
      <form onSubmit={handleSubmit}>
        <label>Interview Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />

        <label>Interview Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br />

        <label>Scheduled Date:</label>
        <input
          type="datetime-local"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          required
        />
        <br />

        <h3>Assign Candidates</h3>
        <ul>
          {candidates.map((user) => (
            <li key={user._id}>
              <input
                type="checkbox"
                value={user._id}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCandidates((prev) =>
                    prev.includes(value)
                      ? prev.filter((id) => id !== value)
                      : [...prev, value]
                  );
                }}
              />
              {user.name} ({user.email})
            </li>
          ))}
        </ul>

        <h3>Interview Questions</h3>
        <div id="questions-container">
          {questions.map((q, index) => (
            <div className="question" key={index}>
              <input
                type="text"
                name="questions[]"
                placeholder="Enter question"
                value={q.questionText}
                onChange={(e) =>
                  updateQuestion(index, "questionText", e.target.value)
                }
                required
              />
              <select
                name="answerTypes[]"
                value={q.answerType}
                onChange={(e) =>
                  updateQuestion(index, "answerType", e.target.value)
                }
              >
                <option value="text">Text-Based Answer</option>
                <option value="file">File Upload</option>
                <option value="recording">Recording on Portal</option>
              </select>
              <label>
                <input
                  type="checkbox"
                  name="recordingRequired[]"
                  checked={q.recordingRequired}
                  onChange={(e) =>
                    updateQuestion(index, "recordingRequired", e.target.checked)
                  }
                />
                Requires Recording
              </label>
            </div>
          ))}
        </div>

        <button type="button" onClick={addQuestion}>
          Add Another Question
        </button>
        <button type="submit">Create Interview</button>
      </form>
    </div>
  );
};

export default CreateInterview;
