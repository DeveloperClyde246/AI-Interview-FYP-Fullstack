import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const NotificationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");
  const [deletable, setDeletable] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/notifications/${id}`, {
          withCredentials: true,
        });

        if (res.status === 200) {
          setNotification(res.data.notification);

          // ✅ Check if the interview is within 24 hours
          const interviewDate = new Date(res.data.interviewDate);
          const now = new Date();
          const timeDiff = interviewDate - now;

          if (timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0) {
            setDeletable(false);
          }
        }
      } catch (err) {
        console.error("Error fetching notification:", err);
        setError("Error fetching notification.");
      }
    };

    fetchNotification();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/notifications/${id}/delete`,
        {},
        { withCredentials: true }
      );
  
      if (res.status === 200) {
        alert("Notification deleted successfully!");
        navigate("/recruiter");
      }
    } catch (err) {
      // ✅ Handle 403 error properly
      if (err.response && err.response.status === 403) {
        alert(err.response.data.message || "You cannot delete this notification because the interview is happening within 24 hours.");
      } else {
        console.error("Error deleting notification:", err);
        alert("Error deleting notification. Please try again.");
      }
    }
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!notification) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Notification Details</h2>
      <p>
        <strong>Message:</strong> {notification.message}
      </p>
      <p>
        <strong>Created At:</strong> {new Date(notification.createdAt).toLocaleString()}
      </p>

      <button onClick={handleDelete} disabled={!deletable}>
        Delete Notification
      </button>
      <br />
      <a href="/recruiter">Back to Dashboard</a>
    </div>
  );
};

export default NotificationDetails;
