import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const NotificationDetails = () => {
  const { id } = useParams(); // Get notification ID from URL
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/notifications/${id}`, {
          withCredentials: true,
        });
        setNotification(res.data.notification);
      } catch (err) {
        console.error("Error fetching notification:", err);
        setError("Failed to load notification.");
      }
    };

    fetchNotification();
  }, [id]);

  const deleteNotification = async () => {
    try {
      await axios.post(
        `http://localhost:5000/notifications/${id}/delete`,
        {},
        { withCredentials: true }
      );
      alert("Notification deleted successfully!");
      navigate("/recruiter"); // Redirect to recruiter dashboard
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification.");
    }
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!notification) {
    return <p>Loading notification...</p>;
  }

  return (
    <div>
      <h2>Notification Details</h2>
      <p>
        <strong>Message:</strong> {notification.message}
      </p>
      <p>
        <strong>Created At:</strong>{" "}
        {new Date(notification.createdAt).toLocaleString()}
      </p>

      <button onClick={deleteNotification} style={{ marginRight: "10px" }}>
        Delete Notification
      </button>
      <button onClick={() => navigate("/recruiter")}>Back to Dashboard</button>
    </div>
  );
};

export default NotificationDetails;
