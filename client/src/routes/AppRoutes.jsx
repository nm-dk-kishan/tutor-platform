import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentRequests from "../pages/student/StudentRequests";
import StudentClasses from "../pages/student/StudentClasses";
import StudentAttendance from "../pages/student/StudentAttendance";

import ParentDashboard from "../pages/parent/ParentDashboard";

import TutorDashboard from "../pages/tutor/TutorDashboard";
import TutorRequests from "../pages/tutor/TutorRequests";
import TutorStudents from "../pages/tutor/TutorStudents";
import TutorClasses from "../pages/tutor/TutorClasses";
import TutorAttendance from "../pages/tutor/TutorAttendance";

import SchoolDashboard from "../pages/school/SchoolDashboard";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminClassSessions from "../pages/admin/AdminClassSessions";

import TutorSearch from "../pages/public/TutorSearch";
import TutorProfile from "../pages/public/TutorProfile";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/tutors/:id" element={<TutorProfile />} />

        <Route path="/tutors" element={<TutorSearch />} />

        {/* =========================
            STUDENT ROUTES
        ========================= */}

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/classes"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentClasses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentAttendance />
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

        {/* =========================
            PARENT ROUTES
        ========================= */}

        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================
            TUTOR ROUTES
        ========================= */}

        <Route
          path="/tutor"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <TutorDashboard />
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
          path="/tutor/students"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <TutorStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/classes"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <TutorClasses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/attendance"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <TutorAttendance />
            </ProtectedRoute>
          }
        />

        {/* =========================
            SCHOOL ROUTES
        ========================= */}

        <Route
          path="/school"
          element={
            <ProtectedRoute allowedRoles={["school"]}>
              <SchoolDashboard />
            </ProtectedRoute>
          }
        />

        {/* =========================
            ADMIN ROUTES
        ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminClassSessions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;