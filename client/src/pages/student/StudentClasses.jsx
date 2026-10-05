import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function StudentClasses() {
  // Store all classes belonging to the logged-in student
  const [sessions, setSessions] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // General error message
  const [error, setError] = useState("");

  // Track which class is being confirmed
  const [confirming, setConfirming] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  // Get student's classes
  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/class-sessions/my");

      if (response.data.success) {
        setSessions(response.data.sessions || []);
      } else {
        setError(
          response.data.message ||
            "Unable to load your classes."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load your classes."
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirm a class after the tutor checks in
  const handleConfirmClass = async (sessionId) => {
    try {
      setError("");
      setConfirming(sessionId);

      const response = await api.patch(
        `/class-sessions/${sessionId}/confirm`
      );

      if (!response.data.success) {
        setError(
          response.data.message ||
            "Unable to confirm the class."
        );
        return;
      }

      // Reload classes after confirmation
      await fetchSessions();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to confirm the class."
      );
    } finally {
      setConfirming("");
    }
  };

  // Format date and time
  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Convert backend status into readable text
  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // Status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";

      case "tutor_checked_in":
        return "bg-amber-100 text-amber-700";

      case "active":
        return "bg-green-100 text-green-700";

      case "completed":
        return "bg-slate-100 text-slate-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "disputed":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-600">
            Loading your classes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Student Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              My Classes
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View your scheduled classes and attendance.
            </p>
          </div>

          <Link
            to="/student"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Heading */}
        <section className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Class Management
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Your classes
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Confirm classes when your tutor arrives.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchSessions}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </section>

        {/* No classes */}
        {sessions.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
              📚
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">
              No classes yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You don't have any scheduled classes right now.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {sessions.map((session) => (
              <article
                key={session._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-950">
                        {session.tutor?.user?.name ||
                          session.tutor?.name ||
                          "Tutor"}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          session.status
                        )}`}
                      >
                        {formatStatus(session.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {session.mode === "home"
                        ? "Home Class"
                        : "Online Class"}
                    </p>
                  </div>

                  {/* Attendance */}
                  <div className="text-left lg:text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Attendance
                    </p>

                    <p className="mt-1 font-bold capitalize text-slate-900">
                      {session.attendanceStatus ||
                        "Pending"}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCard
                    label="Start"
                    value={formatDateTime(
                      session.scheduledStart
                    )}
                  />

                  <InfoCard
                    label="End"
                    value={formatDateTime(
                      session.scheduledEnd
                    )}
                  />

                  <InfoCard
                    label="Location"
                    value={
                      session.mode === "home"
                        ? session.location?.address ||
                          "Home location"
                        : "Online"
                    }
                  />

                  <InfoCard
                    label="Duration"
                    value={
                      session.durationMinutes
                        ? `${session.durationMinutes} minutes`
                        : "Not completed"
                    }
                  />
                </div>

                {/* Tutor checked in */}
                {session.status === "tutor_checked_in" && (
                  <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-amber-900">
                        Your tutor has arrived
                      </p>

                      <p className="mt-1 text-sm text-amber-700">
                        Please confirm that the class has started.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleConfirmClass(session._id)
                      }
                      disabled={
                        confirming === session._id
                      }
                      className="shrink-0 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {confirming === session._id
                        ? "Confirming..."
                        : "Confirm Class"}
                    </button>
                  </div>
                )}

                {/* Active */}
                {session.status === "active" && (
                  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                    <p className="font-semibold text-green-900">
                      Class is active
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      Your tutor has started the class.
                    </p>
                  </div>
                )}

                {/* Completed */}
                {session.status === "completed" && (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <p className="font-semibold text-slate-900">
                      Class completed
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Attendance has been recorded as{" "}
                      <span className="font-semibold">
                        {session.attendanceStatus}
                      </span>
                      .
                    </p>
                  </div>
                )}

                {/* Scheduled */}
                {session.status === "scheduled" && (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-700">
                      Your class is scheduled. You will be
                      able to confirm it after the tutor
                      checks in.
                    </p>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

// Reusable information card
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

export default StudentClasses;