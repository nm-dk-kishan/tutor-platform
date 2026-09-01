import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

import TutorRegister from "../../components/auth/TutorRegister";

import RoleSelection from "../../components/auth/RoleSelection";
import BasicRegisterForm from "../../components/auth/BasicRegisterForm";

import { useAuth } from "../../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const response = await register(formData);

      if (!response.success) {
        setError(response.message);
        return;
      }

      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTutorRegister = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/tutors/register", formData);

      if (!response.data.success) {
        setError(response.data.message);
        return;
      }

      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to submit tutor application.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
              T
            </div>

            <span className="text-xl font-bold text-slate-950">Tutor</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-9">
          {!selectedRole ? (
            <RoleSelection
              selectedRole={selectedRole}
              onSelect={setSelectedRole}
            />
          ) : selectedRole === "tutor" ? (
            <TutorRegister
              onBack={() => {
                setSelectedRole(null);
                setError("");
              }}
              onSubmit={handleTutorRegister}
            />
          ) : (
            <BasicRegisterForm
              role={selectedRole}
              onBack={() => {
                setSelectedRole(null);
                setError("");
              }}
              onSubmit={handleRegister}
              loading={loading}
              error={error}
            />
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
