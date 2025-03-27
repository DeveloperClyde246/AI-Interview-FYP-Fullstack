import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RecruiterInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState("");

  const fetchInterviews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/recruiter/interviews", {
        withCredentials: true,
      });
      setInterviews(res.data.interviews || []);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
      setError("Could not load interviews.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview?")) return;

    try {
      await axios.post(
        `http://localhost:5000/recruiter/interview/${id}/delete`,
        {},
        { withCredentials: true }
      );
      fetchInterviews();
    } catch (err) {
      console.error("Failed to delete interview:", err);
      setError("Failed to delete interview.");
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  return (
    <div>
      <h2>My Interviews</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Title</th>
            <th>Scheduled Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {interviews.length === 0 ? (
            <tr>
              <td colSpan="3">No scheduled interviews</td>
            </tr>
          ) : (
            interviews.map((interview) => (
              <tr key={interview._id}>
                <td>{interview.title}</td>
                <td>
                  {interview.scheduled_date
                    ? new Date(interview.scheduled_date).toLocaleString()
                    : "Not Scheduled"}
                </td>
                <td>
                  <Link to={`/recruiter/interview/${interview._id}`}>View Details</Link>
                  &nbsp;|&nbsp;
                  <button onClick={() => handleDelete(interview._id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default RecruiterInterviews;
