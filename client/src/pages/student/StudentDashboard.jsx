import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-950">Student Dashboard</h1>

      <p className="mt-2 text-slate-600">Welcome, {user?.name}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/student/classes"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          My Classes
        </Link>

        <Link
          to="/student/attendance"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Attendance
        </Link>

        <button
          onClick={logout}
          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      
    </div>
  );
}

export default StudentDashboard;
