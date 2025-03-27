import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/notifications", {
        withCredentials: true,
      });
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError("Failed to load notifications.");
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/notifications/${id}`, {
        withCredentials: true,
      });
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification.");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n._id}>
              {n.message} - {new Date(n.createdAt).toLocaleString()}{" "}
              <button onClick={() => deleteNotification(n._id)}>🗑️ Delete</button>{" "}
              <Link to={`/notifications/${n._id}`}>🔍 View Details</Link>
            </li>
          ))}
        </ul>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Notifications;
