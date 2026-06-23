import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ResumeUpload from "../pages/ResumeUpload";
import ATSReport from "../pages/ATSReport";
import Chatbot from "../pages/Chatbot";
import Profile from "../pages/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<ResumeUpload />} />
      <Route path="/report" element={<ATSReport />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default AppRoutes;