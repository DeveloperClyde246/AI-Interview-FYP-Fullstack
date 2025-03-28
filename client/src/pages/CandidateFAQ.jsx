import React from "react";
import { Link } from "react-router-dom";

const CandidateFAQ = () => {
  return (
    <div>
      <h2>Frequently Asked Questions (FAQ)</h2>

      <h3>1. How do I schedule an interview?</h3>
      <p>
        Interviews are scheduled by recruiters. You will receive a notification
        once an interview is assigned to you.
      </p>

      <h3>2. How do I upload my resume?</h3>
      <p>
        Go to your <Link to="/candidate/profile">profile page</Link> and use the
        "Upload Resume" button to upload a PDF file.
      </p>

      <h3>3. Can I update my profile information?</h3>
      <p>
        Yes! You can update your name and email in your{" "}
        <Link to="/candidate/profile">profile page</Link>.
      </p>

      <h3>4. How do I check my upcoming interviews?</h3>
      <p>
        Your scheduled interviews are listed in your{" "}
        <Link to="/candidate">dashboard</Link>. You will also receive
        notifications for upcoming interviews.
      </p>

      <h3>5. How can I delete my resume?</h3>
      <p>
        You can delete your resume from your{" "}
        <Link to="/candidate/profile">profile page</Link> using the "Delete
        Resume" button.
      </p>

      <h3>6. What happens if I miss an interview?</h3>
      <p>
        If you miss an interview, please contact the recruiter as soon as
        possible to reschedule.
      </p>

      <h3>7. How can I see my interview performance?</h3>
      <p>
        Your interview performance and feedback will be available on your
        dashboard after the interview is completed.
      </p>

      <Link to="/candidate">Back to Dashboard</Link>
    </div>
  );
};

export default CandidateFAQ;
