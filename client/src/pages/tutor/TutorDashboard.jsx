import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function TutorDashboard() {
  const { user, logout } = useAuth();

  const [tutorProfile, setTutorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reapplyLoading, setReapplyLoading] = useState(false);
  const [reapplyError, setReapplyError] = useState("");
  const [reapplySuccess, setReapplySuccess] = useState("");

  const [domain, setDomain] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [subjects, setSubjects] = useState("");
  const [classes, setClasses] = useState("");

  useEffect(() => {
    const fetchTutorProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/tutors/me");

        if (response.data.success) {
          setTutorProfile(response.data.tutorProfile);
        } else {
          setError(
            response.data.message ||
              "Unable to load your tutor profile.",
          );
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load your tutor profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTutorProfile();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });
  };

  const getStatusText = () => {
    if (!tutorProfile) return "Loading";

    switch (tutorProfile.verificationStatus) {
      case "pending_interview":
        return "Interview Pending";

      case "interview_scheduled":
        return "Interview Scheduled";

      case "interview_completed":
        return "Interview Completed";

      case "under_review":
        return "Under Review";

      case "approved":
        return "Approved";

      case "rejected":
        return "Rejected";

      case "cancelled":
        return "Application Cancelled";

      default:
        return "Unknown";
    }
  };

  const getDomainName = () => {
    if (!tutorProfile) return "Not provided";

    if (tutorProfile.domain === "other") {
      return tutorProfile.customDomain || "Other";
    }

    return tutorProfile.domain || "Not provided";
  };

  const getInterviewResultText = () => {
    const result = tutorProfile?.interview?.result;

    if (!result || result === "pending") {
      return "Pending";
    }

    if (result === "passed") {
      return "Passed";
    }

    if (result === "failed") {
      return "Failed";
    }

    return result;
  };

  const handleReapply = async () => {
    setReapplyError("");
    setReapplySuccess("");

    if (!domain.trim()) {
      setReapplyError("Please select a teaching domain.");
      return;
    }

    if (domain === "other" && !customDomain.trim()) {
      setReapplyError("Please enter your custom domain.");
      return;
    }

    const subjectList = subjects
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const classList = classes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (subjectList.length === 0) {
      setReapplyError("Please enter at least one subject.");
      return;
    }

    if (classList.length === 0) {
      setReapplyError("Please enter at least one class.");
      return;
    }

    setReapplyLoading(true);

    try {
      const response = await api.patch("/interviews/reapply", {
        domain: domain.trim(),
        customDomain:
          domain === "other"
            ? customDomain.trim()
            : "",
        subjects: subjectList,
        classes: classList,
      });

      if (!response.data.success) {
        setReapplyError(
          response.data.message ||
            "Unable to resubmit application.",
        );
        return;
      }

      setTutorProfile(response.data.tutorProfile);

      setReapplySuccess(
        "Your application has been resubmitted successfully.",
      );

      setDomain("");
      setCustomDomain("");
      setSubjects("");
      setClasses("");
    } catch (error) {
      setReapplyError(
        error.response?.data?.message ||
          "Unable to resubmit application.",
      );
    } finally {
      setReapplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-600">
            Loading your dashboard...
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
            <h1 className="text-2xl font-bold text-slate-950">
              Tutor Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Welcome back, {user?.name}
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
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        ) : (
          <>
            {/* Welcome */}
            <section className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Tutor Portal
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                Your teaching journey starts here.
              </h2>

              <p className="mt-2 max-w-2xl text-slate-600">
                Manage your tutor profile and track your
                verification process.
              </p>
            </section>

            {/* Verification Status */}
            <section className="mb-6 rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">
                    Verification Status
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-slate-950">
                    {getStatusText()}
                  </h3>
                </div>

                <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
                  {tutorProfile?.verificationStatus
                    ?.replaceAll("_", " ")
                    .replace(/\b\w/g, (letter) =>
                      letter.toUpperCase(),
                    )}
                </div>
              </div>
            </section>

            {/* Scheduled Interview */}
            {tutorProfile?.verificationStatus ===
              "interview_scheduled" &&
              tutorProfile?.interview?.status ===
                "scheduled" && (
                <section className="mb-6 overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-sm">
                  <div className="bg-indigo-600 p-6 text-white">
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">
                      Verification Interview
                    </p>

                    <h3 className="mt-1 text-2xl font-bold">
                      Your interview is scheduled
                    </h3>

                    <p className="mt-2 text-sm text-indigo-100">
                      Please attend the interview at the
                      scheduled date and time.
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <InfoCard
                        label="Interview Date & Time"
                        value={formatDate(
                          tutorProfile.interview
                            .scheduledAt,
                        )}
                      />

                      <InfoCard
                        label="Duration"
                        value={`${tutorProfile.interview.durationMinutes || 30} minutes`}
                      />

                      <InfoCard
                        label="Interview Domain"
                        value={getDomainName()}
                      />

                      <InfoCard
                        label="Interview Status"
                        value="Scheduled"
                      />
                    </div>

                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                      <h4 className="font-bold text-amber-900">
                        Important
                      </h4>

                      <ul className="mt-2 space-y-1 text-sm text-amber-800">
                        <li>
                          • Attend the interview at the
                          scheduled time.
                        </li>

                        <li>
                          • Be prepared for questions related
                          to your teaching domain.
                        </li>

                        <li>
                          • Your verification decision will be
                          made after the interview.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              )}

            {/* Interview Completed */}
            {tutorProfile?.verificationStatus ===
              "interview_completed" && (
                <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                    Verification Interview
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-slate-950">
                    Interview completed
                  </h3>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <InfoCard
                      label="Score"
                      value={`${tutorProfile.interview?.score ?? "N/A"}/100`}
                    />

                    <InfoCard
                      label="Result"
                      value={getInterviewResultText()}
                    />

                    <InfoCard
                      label="Status"
                      value="Completed"
                    />
                  </div>

                  {tutorProfile.interview?.remarks && (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm font-medium text-slate-500">
                        Interview Remarks
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {tutorProfile.interview.remarks}
                      </p>
                    </div>
                  )}
                </section>
              )}

            {/* Rejected */}
            {tutorProfile?.verificationStatus ===
              "rejected" && (
                <section className="mb-6 rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                      Application Rejected
                    </p>

                    <h3 className="mt-1 text-2xl font-bold text-slate-950">
                      Your tutor application was rejected
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      You can review the feedback and submit a
                      new application.
                    </p>
                  </div>

                  {/* Rejection Reason */}
                  {tutorProfile.rejectionReason && (
                    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">
                      <p className="text-sm font-semibold text-red-800">
                        Admin Feedback
                      </p>

                      <p className="mt-2 text-sm leading-6 text-red-700">
                        {tutorProfile.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Reapply */}
                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <h4 className="text-lg font-bold text-slate-950">
                      Reapply as Tutor
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      You can change your teaching domain,
                      subjects, and classes before resubmitting.
                    </p>

                    {reapplyError && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                        {reapplyError}
                      </div>
                    )}

                    {reapplySuccess && (
                      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                        {reapplySuccess}
                      </div>
                    )}

                    <div className="mt-5 space-y-4">
                      {/* Domain */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600">
                          Teaching Domain
                        </label>

                        <select
                          value={domain}
                          onChange={(e) =>
                            setDomain(e.target.value)
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">
                            Select a domain
                          </option>

                          <option value="mathematics">
                            Mathematics
                          </option>

                          <option value="science">
                            Science
                          </option>

                          <option value="english">
                            English
                          </option>

                          <option value="computer_science">
                            Computer Science
                          </option>

                          <option value="engineering">
                            Engineering
                          </option>

                          <option value="commerce">
                            Commerce
                          </option>

                          <option value="arts">
                            Arts
                          </option>

                          <option value="other">
                            Other
                          </option>
                        </select>
                      </div>

                      {/* Custom Domain */}
                      {domain === "other" && (
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-600">
                            Custom Domain
                          </label>

                          <input
                            type="text"
                            value={customDomain}
                            onChange={(e) =>
                              setCustomDomain(e.target.value)
                            }
                            placeholder="Enter your teaching domain"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      )}

                      {/* Subjects */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600">
                          Subjects
                        </label>

                        <input
                          type="text"
                          value={subjects}
                          onChange={(e) =>
                            setSubjects(e.target.value)
                          }
                          placeholder="Example: Mathematics, Algebra, Calculus"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />

                        <p className="mt-1 text-xs text-slate-400">
                          Separate multiple subjects with commas.
                        </p>
                      </div>

                      {/* Classes */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600">
                          Classes
                        </label>

                        <input
                          type="text"
                          value={classes}
                          onChange={(e) =>
                            setClasses(e.target.value)
                          }
                          placeholder="Example: 10th, 11th, 12th"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />

                        <p className="mt-1 text-xs text-slate-400">
                          Separate multiple classes with commas.
                        </p>
                      </div>

                      {/* Submit */}
                      <button
                        onClick={handleReapply}
                        disabled={reapplyLoading}
                        className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reapplyLoading
                          ? "Resubmitting..."
                          : "Submit Reapplication"}
                      </button>
                    </div>
                  </div>
                </section>
              )}

            {/* Approved */}
            {tutorProfile?.verificationStatus ===
              "approved" && (
                <section className="mb-6 rounded-3xl border border-green-200 bg-green-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                    Verification Complete
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-green-950">
                    Congratulations! You are an approved tutor.
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-green-800">
                    Your profile has been verified. You can now
                    receive students through the platform.
                  </p>
                </section>
              )}

            {/* Profile */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Your Profile
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-950">
                Profile Overview
              </h3>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <InfoCard
                  label="Qualification"
                  value={
                    tutorProfile?.qualification ||
                    "Not provided"
                  }
                />

                <InfoCard
                  label="Institution"
                  value={
                    tutorProfile?.institution ||
                    "Not provided"
                  }
                />

                <InfoCard
                  label="Experience"
                  value={`${tutorProfile?.experience ?? 0} years`}
                />

                <InfoCard
                  label="Teaching Mode"
                  value={
                    tutorProfile?.teachingMode ||
                    "Not provided"
                  }
                />

                <InfoCard
                  label="Domain"
                  value={getDomainName()}
                />

                <InfoCard
                  label="Hourly Fee"
                  value={`₹${tutorProfile?.hourlyFee ?? 0}/hour`}
                />

                <InfoCard
                  label="City"
                  value={
                    tutorProfile?.city || "Not provided"
                  }
                />

                <InfoCard
                  label="Area"
                  value={
                    tutorProfile?.area || "Not provided"
                  }
                />

                <InfoCard
                  label="Pincode"
                  value={
                    tutorProfile?.pincode || "Not provided"
                  }
                />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold capitalize text-slate-950">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default TutorDashboard;