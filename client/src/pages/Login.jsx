import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/auth/login",
        { email, password },
        { withCredentials: true } // important for cookie auth!
      );

      // Optionally: make a request to check role
      const { data } = await axios.get("http://localhost:5000/auth/me", {
        withCredentials: true,
      });

      if (data.role === "admin") navigate("/admin");
      else if (data.role === "recruiter") navigate("/recruiter");
      else navigate("/candidate");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
