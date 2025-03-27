import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateInterview = () => {
    const [candidates, setCandidates] = useState([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        scheduled_date: "",
        questions: [{ questionText: "", answerType: "text", recordingRequired: false }],
        candidateIds: [],
        answerDuration: 60, // Default duration in seconds
    });

    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCandidates = async () => {
        const res = await axios.get("http://localhost:5000/recruiter/create-interview", {
            withCredentials: true,
        });
        setCandidates(res.data.candidates);
        };
        fetchCandidates();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (index, key, value) => {
        const updatedQuestions = [...form.questions];
        updatedQuestions[index][key] = value;
        setForm({ ...form, questions: updatedQuestions });
    };

    const addQuestion = () => {
        setForm({
        ...form,
        questions: [
            ...form.questions,
            { questionText: "", answerType: "text", recordingRequired: false },
        ],
        });
    };
    
    
    // const formatDateForBackend = (datetime) => {
    //     const date = new Date(datetime);
    //     return date.toISOString(); // Converts it to a format that MongoDB will recognize
    //   };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
    
        try {
            // const formattedForm = {
            //     ...form,
            //     scheduled_date: formatDateForBackend(form.scheduled_date), // ✅ Format date before sending
            //     };

            await axios.post("http://localhost:5000/recruiter/create-interview", form, {
                withCredentials: true,
            });
        navigate("/recruiter/interviews");
        } catch (err) {
        if (err.response && err.response.status === 400) {
            setError(err.response.data.message);
        } else {
            setError("Error creating interview.");
        }
        }
      };


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
      <h2>Create New Interview</h2>
      <form onSubmit={handleSubmit}>
        <label>Interview Title:</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} required />

        <label>Interview Description:</label>
        <textarea name="description" value={form.description} onChange={handleChange} required />

        <label>Scheduled Date:</label>
        <input type="datetime-local" name="scheduled_date" value={form.scheduled_date} min={getCurrentDateTime()} onChange={handleChange} required />

        <label>Answer Duration (seconds):</label>
        <input
          type="number"
          name="answerDuration"
          value={form.answerDuration}
          onChange={handleChange}
          min="10"
          required
        />

        <h3>Interview Questions</h3>
        {form.questions.map((q, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Enter question"
              value={q.questionText}
              onChange={(e) => handleQuestionChange(index, "questionText", e.target.value)}
              required
            />
            <select
              value={q.answerType}
              onChange={(e) => handleQuestionChange(index, "answerType", e.target.value)}
            >
              <option value="text">Text-Based Answer</option>
              <option value="file">File Upload</option>
              <option value="recording">Recording on Portal</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={q.recordingRequired}
                onChange={(e) =>
                  handleQuestionChange(index, "recordingRequired", e.target.checked)
                }
              />
              Requires Recording
            </label>
          </div>
        ))}
        <button type="button" onClick={addQuestion}>
          ➕ Add Another Question
        </button>

        <h3>Select Candidates</h3>
        {candidates.map((c) => (
          <div key={c._id}>
            <input
              type="checkbox"
              value={c._id}
              checked={form.candidateIds.includes(c._id)}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setForm({
                  ...form,
                  candidateIds: isChecked
                    ? [...form.candidateIds, c._id]
                    : form.candidateIds.filter((id) => id !== c._id),
                });
              }}
            />
            {c.name} ({c.email})
          </div>
        ))}

        <button type="submit">Create Interview</button>
      </form>
    </div>
  );
};

export default CreateInterview;
