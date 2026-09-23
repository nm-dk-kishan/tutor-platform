import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import StudentDashboard from "../pages/student/StudentDashboard";
import ParentDashboard from "../pages/parent/ParentDashboard";
import TutorDashboard from "../pages/tutor/TutorDashboard";
import SchoolDashboard from "../pages/school/SchoolDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import TutorRequests from "../pages/tutor/TutorRequests";
import StudentRequests from "../pages/student/StudentRequests";
import TutorStudents from "../pages/tutor/TutorStudents";

import ProtectedRoute from "./ProtectedRoute";

import TutorSearch from "../pages/public/TutorSearch";
import TutorProfile from "../pages/public/TutorProfile";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tutors/:id" element={<TutorProfile />} />
        <Route path="/tutors" element={<TutorSearch />} />

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Parent */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Tutor */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <TutorDashboard />
            </ProtectedRoute>
          }
        />

        {/* School */}
        <Route
          path="/school"
          element={
            <ProtectedRoute allowedRoles={["school"]}>
              <SchoolDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/requests"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <TutorRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/requests"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/students"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <TutorStudents />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;