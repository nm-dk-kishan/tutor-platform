import { useAuth } from "../../context/AuthContext";

function ParentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold text-slate-950">
        Parent Dashboard
      </h1>

      <p className="mt-2 text-slate-600">
        Welcome, {user?.name}
      </p>

      <button
        onClick={logout}
        className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
      >
        Logout
      </button>
    </div>
  );
}

export default ParentDashboard;