import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function TutorAttendance() {
  // Store all tutor class sessions
  const [sessions, setSessions] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error message
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Get attendance from ClassSession system
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/class-sessions/tutor");

      if (response.data.success) {
        setSessions(response.data.sessions || []);
      } else {
        setError(
          response.data.message ||
            "Unable to load attendance."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  // Format date/time
  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Attendance badge styling
  const getAttendanceStyle = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700";

      case "absent":
        return "bg-red-100 text-red-700";

      case "leave":
        return "bg-amber-100 text-amber-700";

      case "disputed":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Convert status into readable text
  const formatAttendance = (status) => {
    if (!status) {
      return "Pending";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // Attendance summary
  const presentCount = sessions.filter(
    (session) => session.attendanceStatus === "present"
  ).length;

  const absentCount = sessions.filter(
    (session) => session.attendanceStatus === "absent"
  ).length;

  const leaveCount = sessions.filter(
    (session) => session.attendanceStatus === "leave"
  ).length;

  const disputedCount = sessions.filter(
    (session) => session.attendanceStatus === "disputed"
  ).length;

  const pendingCount = sessions.filter(
    (session) =>
      !session.attendanceStatus ||
      session.attendanceStatus === "pending"
  ).length;

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-600">
            Loading attendance...
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
              Tutor Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              Attendance
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View attendance across your classes.
            </p>
          </div>

          <Link
            to="/tutor"
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
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Summary */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            label="Present"
            value={presentCount}
            style="bg-green-50 text-green-700"
          />

          <SummaryCard
            label="Absent"
            value={absentCount}
            style="bg-red-50 text-red-700"
          />

          <SummaryCard
            label="Leave"
            value={leaveCount}
            style="bg-amber-50 text-amber-700"
          />

          <SummaryCard
            label="Disputed"
            value={disputedCount}
            style="bg-purple-50 text-purple-700"
          />

          <SummaryCard
            label="Pending"
            value={pendingCount}
            style="bg-slate-100 text-slate-700"
          />
        </section>

        {/* Heading */}
        <section className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Attendance History
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Your class attendance
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Attendance is generated from GPS-verified class
              sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAttendance}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </section>

        {/* Empty state */}
        {sessions.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
              📋
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">
              No attendance records
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your class attendance will appear here after
              sessions are completed or resolved.
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">
                      {session.student?.name || "Student"}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {session.mode === "home"
                        ? "Home Class"
                        : "Online Class"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${getAttendanceStyle(
                      session.attendanceStatus
                    )}`}
                  >
                    {formatAttendance(
                      session.attendanceStatus
                    )}
                  </span>
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
                    label="Duration"
                    value={
                      session.durationMinutes
                        ? `${session.durationMinutes} minutes`
                        : "Not recorded"
                    }
                  />

                  <InfoCard
                    label="Location"
                    value={
                      session.mode === "home"
                        ? session.location?.address ||
                          "Home"
                        : "Online"
                    }
                  />
                </div>

                {/* Completed */}
                {session.status === "completed" && (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <p className="font-semibold text-slate-900">
                      Class completed
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Attendance:
                      <span className="ml-1 font-semibold">
                        {formatAttendance(
                          session.attendanceStatus
                        )}
                      </span>
                    </p>

                    {session.remarks && (
                      <p className="mt-2 text-sm text-slate-500">
                        Remarks: {session.remarks}
                      </p>
                    )}
                  </div>
                )}

                {/* Tutor absent */}
                {session.status === "tutor_absent" && (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="font-semibold text-red-900">
                      Tutor marked absent
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      The class expired without a tutor
                      check-in.
                    </p>

                    {session.remarks && (
                      <p className="mt-2 text-sm text-red-700">
                        Reason: {session.remarks}
                      </p>
                    )}
                  </div>
                )}

                {/* Disputed */}
                {session.attendanceStatus ===
                  "disputed" && (
                  <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5">
                    <p className="font-semibold text-purple-900">
                      Attendance is disputed
                    </p>

                    <p className="mt-1 text-sm text-purple-700">
                      This session requires admin review.
                    </p>

                    {session.remarks && (
                      <p className="mt-2 text-sm text-purple-700">
                        Reason: {session.remarks}
                      </p>
                    )}
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

function SummaryCard({
  label,
  value,
  style,
}) {
  return (
    <div
      className={`rounded-3xl p-6 ${style}`}
    >
      <p className="text-sm font-semibold">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
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

export default TutorAttendance;