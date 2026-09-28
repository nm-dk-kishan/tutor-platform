import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function TutorClasses() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [mode, setMode] = useState("home");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkingIn, setCheckingIn] = useState("");

  useEffect(() => {
    fetchSessions();
    fetchStudents();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/class-sessions/tutor");

      if (response.data.success) {
        setSessions(response.data.sessions || []);
      } else {
        setError(response.data.message || "Unable to load your classes.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load your classes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get("/tutor-requests/students");

      if (response.data.success) {
        setStudents(response.data.students || []);
      } else {
        setError(response.data.message || "Unable to load your students.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load your students.",
      );
    }
  };

  const handleScheduleClass = async () => {
    try {
      setError("");

      if (!selectedStudent) {
        setError("Please select a student.");
        return;
      }

      if (!scheduledStart || !scheduledEnd) {
        setError("Please select start and end times.");
        return;
      }

      if (new Date(scheduledEnd) <= new Date(scheduledStart)) {
        setError("End time must be after start time.");
        return;
      }

      if (mode === "home") {
        if (!address.trim()) {
          setError("Please enter the class address.");
          return;
        }

        if (!latitude || !longitude) {
          setError("Please enter the class location coordinates.");
          return;
        }

        const numericLatitude = Number(latitude);
        const numericLongitude = Number(longitude);

        if (Number.isNaN(numericLatitude) || Number.isNaN(numericLongitude)) {
          setError("Latitude and longitude must be valid numbers.");
          return;
        }

        if (
          numericLatitude < -90 ||
          numericLatitude > 90 ||
          numericLongitude < -180 ||
          numericLongitude > 180
        ) {
          setError("Please enter valid GPS coordinates.");
          return;
        }
      }

      setSaving(true);

      const payload = {
        studentId: selectedStudent,
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: new Date(scheduledEnd).toISOString(),
        mode,
      };

      if (mode === "home") {
        payload.address = address.trim();
        payload.latitude = Number(latitude);
        payload.longitude = Number(longitude);
      }

      const response = await api.post("/class-sessions", payload);

      if (!response.data.success) {
        setError(response.data.message || "Unable to schedule class.");
        return;
      }

      await fetchSessions();

      setSelectedStudent("");
      setScheduledStart("");
      setScheduledEnd("");
      setMode("home");
      setAddress("");
      setLatitude("");
      setLongitude("");
      setShowForm(false);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to schedule class.");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = (sessionId) => {
    setError("");
    setCheckingIn(sessionId);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setCheckingIn("");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const response = await api.patch(
            `/class-sessions/${sessionId}/check-in`,
            {
              latitude,
              longitude,
            },
          );

          if (!response.data.success) {
            setError(response.data.message || "Unable to start the class.");
            return;
          }

          await fetchSessions();
        } catch (error) {
          setError(
            error.response?.data?.message || "Unable to start the class.",
          );
        } finally {
          setCheckingIn("");
        }
      },
      (error) => {
        let message = "Unable to get your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location permission was denied. Please allow location access and try again.";
            break;

          case error.POSITION_UNAVAILABLE:
            message = "Your current location is unavailable.";
            break;

          case error.TIMEOUT:
            message = "Location request timed out. Please try again.";
            break;

          default:
            message = "Unable to get your current location.";
        }

        setError(message);
        setCheckingIn("");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
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

      case "tutor_absent":
        return "bg-red-100 text-red-700";

      case "student_absent":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-600">Loading your classes...</p>
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
              My Classes
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your scheduled and completed classes.
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
        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 transition hover:text-red-700"
              aria-label="Close error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top section */}
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Class Management
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Your teaching schedule
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Start classes using GPS verification and track attendance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setError("");
                setShowForm((current) => !current);
              }}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              {showForm ? "Close Form" : "Schedule New Class"}
            </button>

            <button
              type="button"
              onClick={fetchSessions}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh Classes
            </button>
          </div>
        </section>

        {/* Schedule form */}
        {showForm && (
          <section className="mb-8 rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                New Class
              </p>

              <h3 className="mt-1 text-2xl font-bold text-slate-950">
                Schedule a class
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Select one of your active students and enter the class details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Student */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Student
                </label>

                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select student</option>

                  {students.map((item) => (
                    <option key={item.student?._id} value={item.student?._id}>
                      {item.student?.name}
                    </option>
                  ))}
                </select>

                {students.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No active students found.
                  </p>
                )}
              </div>

              {/* Mode */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Class Mode
                </label>

                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="home">Home</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {/* Start */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Start Time
                </label>

                <input
                  type="datetime-local"
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* End */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  End Time
                </label>

                <input
                  type="datetime-local"
                  value={scheduledEnd}
                  onChange={(e) => setScheduledEnd(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Home details */}
              {mode === "home" && (
                <>
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Class Address
                    </label>

                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Example: Sector 14, Gurugram"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Latitude */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Latitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="28.4595"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Longitude */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Longitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="77.0266"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <div className="md:col-span-2 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-sm font-semibold text-indigo-900">
                      GPS location
                    </p>

                    <p className="mt-1 text-sm leading-6 text-indigo-700">
                      These coordinates are used later to verify the
                      tutor&apos;s location when starting and ending the class.
                    </p>
                  </div>
                </>
              )}

              {/* Online information */}
              {mode === "online" && (
                <div className="md:col-span-2 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <p className="text-sm font-semibold text-sky-900">
                    Online class
                  </p>

                  <p className="mt-1 text-sm leading-6 text-sky-700">
                    GPS verification will not be required for an online class.
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleScheduleClass}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Scheduling..." : "Schedule Class"}
              </button>
            </div>
          </section>
        )}

        {/* Classes */}
        {sessions.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
              📚
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">
              No classes scheduled
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You don&apos;t have any class sessions yet. Schedule your first
              class above.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {sessions.map((session) => (
              <article
                key={session._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Top row */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-950">
                        {session.student?.name || "Student"}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          session.status,
                        )}`}
                      >
                        {formatStatus(session.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {session.mode === "home" ? "Home Class" : "Online Class"}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Attendance
                    </p>

                    <p className="mt-1 font-bold capitalize text-slate-900">
                      {session.attendanceStatus || "Pending"}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCard
                    label="Start"
                    value={formatDateTime(session.scheduledStart)}
                  />

                  <InfoCard
                    label="End"
                    value={formatDateTime(session.scheduledEnd)}
                  />

                  <InfoCard
                    label="Location"
                    value={
                      session.mode === "home"
                        ? session.location?.address || "Home location"
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

                {/* Status message */}
                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  {session.status === "scheduled" && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-700">
                        This class is scheduled. Start the class when you arrive
                        at the class location.
                      </p>

                      <button
                        type="button"
                        onClick={() => handleCheckIn(session._id)}
                        disabled={checkingIn === session._id}
                        className="shrink-0 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {checkingIn === session._id
                          ? "Verifying Location..."
                          : "Start Class"}
                      </button>
                    </div>
                  )}

                  {session.status === "tutor_checked_in" && (
                    <p className="text-sm font-medium text-amber-700">
                      You have checked in. Waiting for the student to confirm
                      the class.
                    </p>
                  )}

                  {session.status === "active" && (
                    <p className="text-sm font-medium text-green-700">
                      Class is currently active.
                    </p>
                  )}

                  {session.status === "completed" && (
                    <p className="text-sm font-medium text-slate-700">
                      Class completed successfully and attendance was recorded.
                    </p>
                  )}

                  {session.status === "cancelled" && (
                    <p className="text-sm font-medium text-red-700">
                      This class has been cancelled.
                    </p>
                  )}

                  {session.status === "disputed" && (
                    <p className="text-sm font-medium text-purple-700">
                      This class attendance is currently under dispute.
                    </p>
                  )}

                  {session.status === "tutor_absent" && (
                    <p className="text-sm font-medium text-red-700">
                      The tutor was marked absent for this class.
                    </p>
                  )}

                  {session.status === "student_absent" && (
                    <p className="text-sm font-medium text-red-700">
                      The student was marked absent for this class.
                    </p>
                  )}
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

      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default TutorClasses;
