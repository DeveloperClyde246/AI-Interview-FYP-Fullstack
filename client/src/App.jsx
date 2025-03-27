import { BrowserRouter, Routes, Route } from "react-router-dom";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterInterviews from "./pages/RecruiterInterviews";
import RecruiterInterviewDetails from "./pages/RecruiterInterviewDetails";
import RecruiterInterviewResults from "./pages/RecruiterInterviewResults";
import NotificationDetails from "./pages/NotificationDetails";
import CreateInterview from "./pages/CreateInterview";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/users" element={<Users />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
        <Route path="/recruiter/interview/:id" element={<RecruiterInterviewDetails />} />
        <Route path="/recruiter/interview-results" element={<RecruiterInterviewResults />} />
        <Route path="/notifications/:id" element={<NotificationDetails />} />
        <Route path="/recruiter/create-interview" element={<CreateInterview />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
