import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import TutorApplicationDetails from "./TutorApplicationDetails";

function AdminDashboard() {
  const { user, logout } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/interviews/applications");

      if (response.data.success) {
        setApplications(response.data.tutorProfiles || []);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load tutor applications",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Welcome, {user?.name}
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Tutor Verification
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Tutor Applications
          </h2>

          <p className="mt-2 text-slate-600">
            Review tutor applications and manage their verification process.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Applications
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {applications.length}
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending Interview
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {
                applications.filter(
                  (app) =>
                    app.verificationStatus === "pending_interview",
                ).length
              }
            </p>
          </div>

          {/* Scheduled */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Interview Scheduled
            </p>

            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {
                applications.filter(
                  (app) =>
                    app.verificationStatus === "interview_scheduled",
                ).length
              }
            </p>
          </div>

          {/* Approved */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                applications.filter(
                  (app) =>
                    app.verificationStatus === "approved",
                ).length
              }
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Applications */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-950">
              Applications
            </h3>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            /* Empty */
            <div className="p-8 text-center text-slate-500">
              No tutor applications found.
            </div>
          ) : (
            /* List */
            <div className="divide-y divide-slate-100">
              {applications.map((application) => (
                <div
                  key={application._id}
                  onClick={() =>
                    setSelectedApplication(application)
                  }
                  className="flex cursor-pointer flex-col gap-5 p-6 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* Tutor Info */}
                  <div>
                    <h4 className="font-bold text-slate-950">
                      {application.user?.name || "Unknown Tutor"}
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {application.user?.email || "No email"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      {/* Domain */}
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">
                        {application.domain === "other"
                          ? application.customDomain
                          : application.domain}
                      </span>

                      {/* Experience */}
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">
                        {application.experience} years experience
                      </span>

                      {/* Fee */}
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">
                        ₹{application.hourlyFee}/hour
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700">
                      {getStatusLabel(
                        application.verificationStatus,
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Details */}
        {selectedApplication && (
          <TutorApplicationDetails
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onUpdated={fetchApplications}
          />
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;