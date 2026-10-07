import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function TutorClasses() {
  // Store all class sessions
  const [sessions, setSessions] = useState([]);

  // Page loading state
  const [loading, setLoading] = useState(true);

  // General error message
  const [error, setError] = useState("");

  // Show/hide schedule form
  const [showForm, setShowForm] = useState(false);

  // Active students connected to this tutor
  const [students, setStudents] = useState([]);

  // Schedule form states
  const [selectedStudent, setSelectedStudent] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [mode, setMode] = useState("home");

  // Home class location
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Loading states
  const [saving, setSaving] = useState(false);
  const [checkingIn, setCheckingIn] = useState("");
  const [checkingOut, setCheckingOut] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [gettingAddress, setGettingAddress] = useState(false);

  // Load classes and students when page opens
  useEffect(() => {
    fetchSessions();
    fetchStudents();
  }, []);

  // Get tutor's class sessions
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

  // Get students connected to the tutor
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

  // Get the tutor's current browser GPS location
  const handleGetCurrentLocation = () => {
    setError("");
    setGettingLocation(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;

        // Save GPS coordinates
        setLatitude(currentLatitude.toString());
        setLongitude(currentLongitude.toString());

        // Start reverse geocoding
        setGettingAddress(true);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${currentLatitude}&lon=${currentLongitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Unable to fetch address.");
          }

          const data = await response.json();

          // Use the readable display address returned by Nominatim
          if (data.display_name) {
            setAddress(data.display_name);
          } else {
            setAddress(
              `${currentLatitude.toFixed(6)}, ${currentLongitude.toFixed(6)}`,
            );
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);

          setAddress(
            `${currentLatitude.toFixed(6)}, ${currentLongitude.toFixed(6)}`,
          );

          setError(
            "Location found, but the readable address could not be loaded.",
          );
        } finally {
          setGettingAddress(false);
          setGettingLocation(false);
        }
      },
      (error) => {
        let message = "Unable to get your current location.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location permission was denied. Please allow location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }

        setError(message);
        setGettingLocation(false);
        setGettingAddress(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // Schedule a new class
  const handleScheduleClass = async () => {
    try {
      setError("");

      // Student is required
      if (!selectedStudent) {
        setError("Please select a student.");
        return;
      }

      // Start and end times are required
      if (!scheduledStart || !scheduledEnd) {
        setError("Please select start and end times.");
        return;
      }

      // End must be after start
      if (new Date(scheduledEnd) <= new Date(scheduledStart)) {
        setError("End time must be after start time.");
        return;
      }

      // Home classes need location information
      if (mode === "home") {
        if (!address.trim()) {
          setError("Please enter the class address.");
          return;
        }

        if (!latitude || !longitude) {
          setError(
            "Please use your current location or enter valid coordinates.",
          );
          return;
        }

        const numericLatitude = Number(latitude);
        const numericLongitude = Number(longitude);

        // Check that coordinates are numbers
        if (Number.isNaN(numericLatitude) || Number.isNaN(numericLongitude)) {
          setError("Latitude and longitude must be valid numbers.");
          return;
        }

        // Check valid latitude/longitude ranges
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

      // Create request payload
      const payload = {
        studentId: selectedStudent,

        // Convert local date/time to ISO format
        scheduledStart: new Date(scheduledStart).toISOString(),

        scheduledEnd: new Date(scheduledEnd).toISOString(),

        mode,
      };

      // Add location only for home classes
      if (mode === "home") {
        payload.address = address.trim();
        payload.latitude = Number(latitude);
        payload.longitude = Number(longitude);
      }

      // Send request to backend
      const response = await api.post("/class-sessions", payload);

      if (!response.data.success) {
        setError(response.data.message || "Unable to schedule class.");
        return;
      }

      // Refresh class list
      await fetchSessions();

      // Clear form
      setSelectedStudent("");
      setScheduledStart("");
      setScheduledEnd("");
      setMode("home");
      setAddress("");
      setLatitude("");
      setLongitude("");

      // Close form
      setShowForm(false);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to schedule class.");
    } finally {
      setSaving(false);
    }
  };

  // Start a class using the tutor's current GPS location
  const handleCheckIn = (sessionId) => {
    setError("");
    setCheckingIn(sessionId);

    // Check browser GPS support
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setCheckingIn("");
      return;
    }

    // Get current GPS location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Current tutor location
          const currentLatitude = position.coords.latitude;

          const currentLongitude = position.coords.longitude;

          // Send GPS coordinates to backend
          const response = await api.patch(
            `/class-sessions/${sessionId}/check-in`,
            {
              latitude: currentLatitude,
              longitude: currentLongitude,
            },
          );

          // Handle backend error
          if (!response.data.success) {
            setError(response.data.message || "Unable to start the class.");
            return;
          }

          // Refresh class list
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

        // Permission denied
        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location permission was denied. Please allow location access and try again.";
        }

        // Location unavailable
        else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable.";
        }

        // Location request timed out
        else if (error.code === error.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }

        setError(message);
        setCheckingIn("");
      },
      {
        // Better GPS accuracy
        enableHighAccuracy: true,

        // Maximum wait time
        timeout: 15000,

        // Always request fresh location
        maximumAge: 0,
      },
    );
  };

  const handleCheckOut = (sessionId) => {
    setError("");
    setCheckingOut(sessionId);

    // Check browser GPS support
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setCheckingOut("");
      return;
    }

    // Get the tutor's current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Send current GPS position to backend
          const response = await api.patch(
            `/class-sessions/${sessionId}/check-out`,
            {
              latitude,
              longitude,
            },
          );

          if (!response.data.success) {
            setError(response.data.message || "Unable to end the class.");
            return;
          }

          // Reload sessions so the UI shows completed/present
          await fetchSessions();
        } catch (error) {
          setError(error.response?.data?.message || "Unable to end the class.");
        } finally {
          setCheckingOut("");
        }
      },
      (error) => {
        let message = "Unable to get your current location.";

        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location permission was denied. Please allow location access and try again.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }

        setError(message);
        setCheckingOut("");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // Format dates for display
  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Get badge styling based on session status
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

  // Convert status to readable text
  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // Check whether a class has already passed
  const isExpired = (session) => {
    // These statuses already describe the final state
    // of the class, so they should not be displayed as "Expired".
    if (
      session.status === "completed" ||
      session.status === "cancelled" ||
      session.status === "disputed" ||
      session.status === "tutor_absent" ||
      session.status === "student_absent"
    ) {
      return false;
    }

    // Without an end time we cannot determine expiry.
    if (!session.scheduledEnd) {
      return false;
    }

    // A scheduled or in-progress class is expired
    // when its scheduled end time has passed.
    return new Date(session.scheduledEnd) < new Date();
  };

  // Loading screen
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
        {/* Error message */}
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

        {/* Page heading */}
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
            {/* Open schedule form */}
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

            {/* Refresh */}
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

              {/* Start time */}
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

              {/* End time */}
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

              {/* Home class location */}
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
                      placeholder="Click Use My Current Location"
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
                      placeholder="Click Use My Current Location"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Current location button */}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={gettingLocation}
                      className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {gettingLocation
                        ? "Getting Location..."
                        : gettingAddress
                          ? "Finding Address..."
                          : "📍 Use My Current Location"}
                    </button>
                  </div>

                  {/* GPS information */}
                  <div className="md:col-span-2 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="text-sm font-semibold text-indigo-900">
                      GPS verification
                    </p>

                    <p className="mt-1 text-sm leading-6 text-indigo-700">
                      The saved location is used to verify that the tutor is
                      within 100 meters of the class location when starting and
                      ending a home class.
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
                    GPS verification is not used for the class location.
                  </p>
                </div>
              )}
            </div>

            {/* Schedule button */}
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

        {/* Class list */}
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
                {/* Session header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-950">
                        {session.student?.name || "Student"}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isExpired(session)
                            ? "bg-red-100 text-red-700"
                            : getStatusStyle(session.status)
                        }`}
                      >
                        {isExpired(session)
                          ? "Expired"
                          : formatStatus(session.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {session.mode === "home" ? "Home Class" : "Online Class"}
                    </p>
                  </div>

                  {/* Attendance */}
                  <div className="text-left lg:text-right">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Attendance
                    </p>

                    <p className="mt-1 font-bold capitalize text-slate-900">
                      {session.attendanceStatus || "Pending"}
                    </p>
                  </div>
                </div>

                {/* Session details */}
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

                {/* Session actions/status */}
                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  {/* Scheduled */}
                  {/* Scheduled or expired */}
                  {session.status === "scheduled" && (
                    <>
                      {isExpired(session) ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                          <p className="font-semibold text-red-800">
                            This class has expired.
                          </p>

                          <p className="mt-1 text-sm text-red-700">
                            The scheduled class time has already passed, so it
                            can no longer be started.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-slate-700">
                            This class is scheduled. Start the class when you
                            arrive at the class location.
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
                    </>
                  )}

                  {/* Tutor checked in */}
                  {session.status === "tutor_checked_in" && (
                    <>
                      {isExpired(session) ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                          <p className="font-semibold text-red-800">
                            This class has expired.
                          </p>

                          <p className="mt-1 text-sm text-red-700">
                            The scheduled class time has passed before the
                            student completed the confirmation.
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-amber-700">
                          You have checked in. Waiting for the student to
                          confirm the class.
                        </p>
                      )}
                    </>
                  )}

                  {/* Active */}
                  {session.status === "active" && (
                    <>
                      {isExpired(session) ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                          <p className="font-semibold text-red-800">
                            This class session has expired.
                          </p>

                          <p className="mt-1 text-sm text-red-700">
                            The scheduled class end time has passed, so this
                            session can no longer be ended normally.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">
                              Class is currently active.
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              End the class when the session is finished.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCheckOut(session._id)}
                            disabled={checkingOut === session._id}
                            className="shrink-0 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {checkingOut === session._id
                              ? "Verifying Location..."
                              : "End Class"}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Completed */}
                  {session.status === "completed" && (
                    <p className="text-sm font-medium text-slate-700">
                      Class completed successfully and attendance was recorded.
                    </p>
                  )}

                  {/* Cancelled */}
                  {session.status === "cancelled" && (
                    <p className="text-sm font-medium text-red-700">
                      This class has been cancelled.
                    </p>
                  )}

                  {/* Disputed */}
                  {session.status === "disputed" && (
                    <p className="text-sm font-medium text-purple-700">
                      This class attendance is currently under dispute.
                    </p>
                  )}

                  {/* Tutor absent */}
                  {session.status === "tutor_absent" && (
                    <p className="text-sm font-medium text-red-700">
                      The tutor was marked absent for this class.
                    </p>
                  )}

                  {/* Student absent */}
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

// Reusable information card
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
