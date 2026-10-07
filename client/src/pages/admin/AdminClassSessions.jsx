import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function AdminClassSessions() {
  // Store disputed sessions
  const [sessions, setSessions] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error message
  const [error, setError] = useState("");

  // Track which session is being resolved
  const [resolving, setResolving] = useState("");

  // Store selected attendance decision
  const [selectedStatus, setSelectedStatus] = useState({});

  // Store admin remarks
  const [remarks, setRemarks] = useState({});

  // Load disputed sessions
  useEffect(() => {
    fetchDisputedSessions();
  }, []);

  const fetchDisputedSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/class-sessions/admin/disputed"
      );

      if (response.data.success) {
        setSessions(response.data.sessions || []);
      } else {
        setError(
          response.data.message ||
            "Unable to load disputed classes."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load disputed classes."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resolve a disputed class
  const handleResolve = async (sessionId) => {
    try {
      setError("");

      const attendanceStatus =
        selectedStatus[sessionId];

      if (!attendanceStatus) {
        setError("Please select an attendance status.");
        return;
      }

      setResolving(sessionId);

      const response = await api.patch(
        `/class-sessions/${sessionId}/resolve`,
        {
          attendanceStatus,
          remarks: remarks[sessionId] || "",
        }
      );

      if (!response.data.success) {
        setError(
          response.data.message ||
            "Unable to resolve attendance."
        );
        return;
      }

      // Remove resolved class from disputed list
      setSessions((current) =>
        current.filter(
          (session) => session._id !== sessionId
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to resolve attendance."
      );
    } finally {
      setResolving("");
    }
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">
              Admin Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              Attendance Review
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review and resolve disputed class sessions.
            </p>
          </div>

          <Link
            to="/admin"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Heading */}
        <section className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-purple-600">
              Dispute Management
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Disputed Classes
            </h2>
          </div>

          <button
            type="button"
            onClick={fetchDisputedSessions}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </section>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />
          </div>
        ) : sessions.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-2xl">
              ✅
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">
              No disputed classes
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              All attendance disputes have been resolved.
            </p>
          </section>
        ) : (
          <section className="space-y-6">
            {sessions.map((session) => (
              <article
                key={session._id}
                className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-950">
                        {session.student?.name ||
                          "Student"}
                      </h3>

                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        Disputed
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {session.tutor?.user?.name ||
                        "Tutor"}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCard
                    label="Class Start"
                    value={formatDateTime(
                      session.scheduledStart
                    )}
                  />

                  <InfoCard
                    label="Class End"
                    value={formatDateTime(
                      session.scheduledEnd
                    )}
                  />

                  <InfoCard
                    label="Mode"
                    value={
                      session.mode === "home"
                        ? "Home Class"
                        : "Online Class"
                    }
                  />

                  <InfoCard
                    label="Location"
                    value={
                      session.location?.address ||
                      "Online"
                    }
                  />
                </div>

                {/* Existing reason */}
                <div className="mt-6 rounded-2xl bg-purple-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-500">
                    Reason
                  </p>

                  <p className="mt-2 text-sm leading-6 text-purple-900">
                    {session.remarks ||
                      "No additional remarks."}
                  </p>
                </div>

                {/* Resolution */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="font-semibold text-slate-950">
                    Resolve Attendance
                  </h4>

                  {/* Status */}
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Attendance Status
                    </label>

                    <select
                      value={
                        selectedStatus[session._id] || ""
                      }
                      onChange={(e) =>
                        setSelectedStatus((current) => ({
                          ...current,
                          [session._id]:
                            e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                    >
                      <option value="">
                        Select status
                      </option>

                      <option value="present">
                        Present
                      </option>

                      <option value="absent">
                        Absent
                      </option>

                      <option value="leave">
                        Leave
                      </option>
                    </select>
                  </div>

                  {/* Remarks */}
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Admin Remarks
                    </label>

                    <textarea
                      rows="3"
                      value={remarks[session._id] || ""}
                      onChange={(e) =>
                        setRemarks((current) => ({
                          ...current,
                          [session._id]:
                            e.target.value,
                        }))
                      }
                      placeholder="Explain the resolution..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Resolve button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        handleResolve(session._id)
                      }
                      disabled={
                        resolving === session._id
                      }
                      className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resolving === session._id
                        ? "Resolving..."
                        : "Resolve Attendance"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default AdminClassSessions;