import { BrowserRouter, Routes, Route } from "react-router-dom";
//auth
import Users from "./pages/Users";
import Login from "./pages/Login";
import Register from "./pages/Register";
//admin
import AdminDashboard from "./pages/AdminDashboard";
//recruiter
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterInterviews from "./pages/RecruiterInterviews";
import RecruiterInterviewDetails from "./pages/RecruiterInterviewDetails";
import RecruiterInterviewResults from "./pages/RecruiterInterviewResults";
import NotificationDetails from "./pages/NotificationDetails";
//candidate
import CreateInterview from "./pages/CreateInterview";
import CandidateFAQ from "./pages/CandidateFAQ";
import CandidateDashboard from "./pages/CandidateDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* admin */}
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* recruiter */}
        <Route path="/recruiter" element={<RecruiterDashboard />} />
        <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
        <Route path="/recruiter/interview/:id" element={<RecruiterInterviewDetails />} />
        <Route path="/recruiter/interview-results" element={<RecruiterInterviewResults />} />
        <Route path="/notifications/:id" element={<NotificationDetails />} />
        <Route path="/recruiter/create-interview" element={<CreateInterview />} />

        {/* candidate */}
        <Route path="/candidate/faq" element={<CandidateFAQ />} />
        <Route path="/candidate" element={<CandidateDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
