import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RecruiterInterviewResults = () => {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    try {
      const res = await axios.get("http://localhost:5000/recruiter/interview-results", {
        withCredentials: true,
      });
      setInterviews(res.data.interviews);
    } catch (err) {
      console.error("Error loading results:", err);
      setError("Failed to load interview results.");
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <div>
      <h2>Interview Analysis Results</h2>
      {interviews.length === 0 ? (
        <p>No interviews found.</p>
      ) : (
        interviews.map((interview) => (
          <div key={interview._id}>
            <h3>
              {interview.title} —{" "}
              {new Date(interview.scheduled_date).toLocaleString()}
            </h3>
            <p>{interview.description}</p>

            {interview.responses.length === 0 ? (
              <p>No candidates have answered yet.</p>
            ) : (
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Email</th>
                    <th>Marks</th>
                    <th>Submitted Answers</th>
                  </tr>
                </thead>
                <tbody>
                  {interview.responses.map((response, idx) => (
                    <tr key={idx}>
                      <td>{response.candidate?.name || "Unknown"}</td>
                      <td>{response.candidate?.email || "Unknown"}</td>
                      <td>
                        {response.videoMarks && response.videoMarks.length > 0 ? (
                          <>
                            <ul>
                              {response.videoMarks.map((mark, i) => (
                                <li key={i}>Video {i + 1}: {mark} marks</li>
                              ))}
                            </ul>
                            <strong>Average: {response.marks} marks</strong>
                          </>
                        ) : (
                          <i>Pending</i>
                        )}
                      </td>
                      <td>
                        <ul>
                          {response.answers.map((ans, i) => (
                            <li key={i}>
                              {ans.startsWith("http") ? (
                                <a href={ans} target="_blank" rel="noreferrer">View File</a>
                              ) : (
                                ans
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <hr />
          </div>
        ))
      )}
      <br />
      <Link to="/recruiter">← Back to Dashboard</Link>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default RecruiterInterviewResults;
