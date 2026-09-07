import { useState } from "react";
import api from "../../services/api";

function TutorApplicationDetails({
  application,
  onClose,
  onUpdated,
}) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [score, setScore] = useState("");
  const [remarks, setRemarks] = useState("");

  const [rejectionReason, setRejectionReason] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  if (!application) return null;

  const getStatusLabel = (status) =>
    status
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const handleScheduleInterview = async () => {
    if (!scheduledAt) {
      setActionError("Please select an interview date and time.");
      return;
    }

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await api.patch(
        `/interviews/schedule/${application._id}`,
        {
          scheduledAt,
          durationMinutes: Number(durationMinutes),
        },
      );

      if (!response.data.success) {
        setActionError(
          response.data.message || "Unable to schedule interview.",
        );
        return;
      }

      setActionSuccess("Interview scheduled successfully.");

      onUpdated?.();

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to schedule interview.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (score === "") {
      setActionError("Please enter an interview score.");
      return;
    }

    const numericScore = Number(score);

    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      setActionError("Score must be between 0 and 100.");
      return;
    }

    if (!remarks.trim()) {
      setActionError("Please add interview remarks.");
      return;
    }

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await api.patch(
        `/interviews/complete/${application._id}`,
        {
          score: numericScore,
          remarks: remarks.trim(),
        },
      );

      if (!response.data.success) {
        setActionError(
          response.data.message ||
            "Unable to complete interview.",
        );
        return;
      }

      setActionSuccess("Interview completed successfully.");

      onUpdated?.();

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to complete interview.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveTutor = async () => {
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await api.patch(
        `/interviews/approve/${application._id}`,
      );

      if (!response.data.success) {
        setActionError(
          response.data.message ||
            "Unable to approve tutor.",
        );
        return;
      }

      setActionSuccess("Tutor approved successfully.");

      onUpdated?.();

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to approve tutor.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectTutor = async () => {
    if (!rejectionReason.trim()) {
      setActionError("Please enter a rejection reason.");
      return;
    }

    setActionLoading(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await api.patch(
        `/interviews/reject/${application._id}`,
        {
          reason: rejectionReason.trim(),
        },
      );

      if (!response.data.success) {
        setActionError(
          response.data.message ||
            "Unable to reject tutor.",
        );
        return;
      }

      setActionSuccess("Tutor rejected successfully.");

      onUpdated?.();

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          "Unable to reject tutor.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const canSchedule =
    application.verificationStatus === "pending_interview";

  const canComplete =
    application.verificationStatus ===
      "interview_scheduled" &&
    application.interview?.status === "scheduled";

  const canReview =
    application.verificationStatus ===
      "interview_completed" &&
    application.interview?.status === "completed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Tutor Application
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review tutor information and manage verification.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">

          {/* Global Error */}
          {actionError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {actionError}
            </div>
          )}

          {/* Global Success */}
          {actionSuccess && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {actionSuccess}
            </div>
          )}

          {/* Basic Information */}
          <section>
            <h3 className="mb-4 text-lg font-bold text-slate-950">
              Basic Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <Info
                label="Name"
                value={application.user?.name}
              />

              <Info
                label="Email"
                value={application.user?.email}
              />

              <Info
                label="Phone"
                value={application.user?.phone}
              />

              <Info
                label="Status"
                value={getStatusLabel(
                  application.verificationStatus,
                )}
              />
            </div>
          </section>

          {/* Professional Information */}
          <section>
            <h3 className="mb-4 text-lg font-bold text-slate-950">
              Professional Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <Info
                label="Qualification"
                value={application.qualification}
              />

              <Info
                label="Institution"
                value={application.institution}
              />

              <Info
                label="Experience"
                value={`${application.experience} years`}
              />

              <Info
                label="Domain"
                value={
                  application.domain === "other"
                    ? application.customDomain
                    : application.domain
                }
              />

              <Info
                label="Teaching Mode"
                value={application.teachingMode}
              />

              <Info
                label="Hourly Fee"
                value={`₹${application.hourlyFee}/hour`}
              />
            </div>
          </section>

          {/* Teaching Details */}
          <section>
            <h3 className="mb-4 text-lg font-bold text-slate-950">
              Teaching Details
            </h3>

            <div className="space-y-4">

              {/* Subjects */}
              <div>
                <p className="mb-2 text-sm font-medium text-slate-500">
                  Subjects
                </p>

                <div className="flex flex-wrap gap-2">
                  {application.subjects?.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Classes */}
              <div>
                <p className="mb-2 text-sm font-medium text-slate-500">
                  Classes
                </p>

                <div className="flex flex-wrap gap-2">
                  {application.classes?.map((className) => (
                    <span
                      key={className}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {className}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h3 className="mb-4 text-lg font-bold text-slate-950">
              Location
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <Info
                label="City"
                value={application.city}
              />

              <Info
                label="Area"
                value={application.area}
              />

              <Info
                label="Pincode"
                value={application.pincode}
              />
            </div>
          </section>

          {/* Bio */}
          <section>
            <h3 className="mb-3 text-lg font-bold text-slate-950">
              About Tutor
            </h3>

            <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {application.bio || "No bio provided."}
            </p>
          </section>

          {/* Verification Interview */}
          <section>
            <h3 className="mb-4 text-lg font-bold text-slate-950">
              Verification Interview
            </h3>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              {/* Interview Information */}
              <div className="grid gap-4 sm:grid-cols-2">

                <Info
                  label="Interview Status"
                  value={getStatusLabel(
                    application.interview?.status,
                  )}
                />

                <Info
                  label="Interview Result"
                  value={getStatusLabel(
                    application.interview?.result,
                  )}
                />

                <Info
                  label="Score"
                  value={
                    application.interview?.score !==
                    undefined
                      ? `${application.interview.score}/100`
                      : "Not completed"
                  }
                />

                <Info
                  label="Duration"
                  value={
                    application.interview
                      ?.durationMinutes
                      ? `${application.interview.durationMinutes} minutes`
                      : "30 minutes"
                  }
                />

                <Info
                  label="Scheduled At"
                  value={
                    application.interview?.scheduledAt
                      ? new Date(
                          application.interview.scheduledAt,
                        ).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Not scheduled"
                  }
                />
              </div>

              {/* Existing Remarks */}
              {application.interview?.remarks && (
                <div className="mt-5 rounded-xl bg-white p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Interview Remarks
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {application.interview.remarks}
                  </p>
                </div>
              )}

              {/* Schedule Interview */}
              {canSchedule && (
                <div className="mt-6 border-t border-slate-200 pt-6">

                  <h4 className="text-base font-bold text-slate-950">
                    Schedule Interview
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Select when the tutor should attend the
                    verification interview.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">

                    {/* Date */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Interview Date & Time
                      </label>

                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) =>
                          setScheduledAt(e.target.value)
                        }
                        min={new Date()
                          .toISOString()
                          .slice(0, 16)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Duration
                      </label>

                      <select
                        value={durationMinutes}
                        onChange={(e) =>
                          setDurationMinutes(
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      >
                        <option value={15}>
                          15 minutes
                        </option>

                        <option value={30}>
                          30 minutes
                        </option>

                        <option value={45}>
                          45 minutes
                        </option>

                        <option value={60}>
                          60 minutes
                        </option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleScheduleInterview}
                    disabled={actionLoading}
                    className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading
                      ? "Scheduling..."
                      : "Schedule Interview"}
                  </button>
                </div>
              )}

              {/* Complete Interview */}
              {canComplete && (
                <div className="mt-6 border-t border-slate-200 pt-6">

                  <h4 className="text-base font-bold text-slate-950">
                    Complete Interview
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter the tutor's interview score and
                    evaluation remarks.
                  </p>

                  <div className="mt-4 space-y-4">

                    {/* Score */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Interview Score
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) =>
                          setScore(e.target.value)
                        }
                        placeholder="Enter score (0-100)"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">
                        Interview Remarks
                      </label>

                      <textarea
                        rows="4"
                        value={remarks}
                        onChange={(e) =>
                          setRemarks(e.target.value)
                        }
                        placeholder="Enter interview feedback and remarks..."
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    {/* Pass threshold */}
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                      <p className="text-sm font-medium text-indigo-800">
                        Passing score: 60/100
                      </p>

                      <p className="mt-1 text-xs text-indigo-700">
                        Score 60 or above will mark the
                        interview as passed.
                      </p>
                    </div>

                    <button
                      onClick={handleCompleteInterview}
                      disabled={actionLoading}
                      className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading
                        ? "Completing..."
                        : "Complete Interview"}
                    </button>
                  </div>
                </div>
              )}

              {/* Approve / Reject */}
              {canReview && (
                <div className="mt-6 border-t border-slate-200 pt-6">

                  <h4 className="text-base font-bold text-slate-950">
                    Final Verification Decision
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Review the interview result and decide
                    whether to approve this tutor.
                  </p>

                  {/* Passed */}
                  {application.interview?.result ===
                    "passed" && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                      <p className="font-semibold text-green-800">
                        Interview Passed
                      </p>

                      <p className="mt-1 text-sm text-green-700">
                        The tutor scored{" "}
                        {application.interview.score}/100
                        and is eligible for approval.
                      </p>
                    </div>
                  )}

                  {/* Failed */}
                  {application.interview?.result ===
                    "failed" && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="font-semibold text-red-800">
                        Interview Failed
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        The tutor scored{" "}
                        {application.interview.score}/100.
                        Approval is not available.
                      </p>
                    </div>
                  )}

                  {/* Approve */}
                  {application.interview?.result ===
                    "passed" && (
                    <button
                      onClick={handleApproveTutor}
                      disabled={actionLoading}
                      className="mt-5 w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading
                        ? "Approving..."
                        : "Approve Tutor"}
                    </button>
                  )}

                  {/* Reject */}
                  <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/50 p-5">

                    <h5 className="font-semibold text-slate-950">
                      Reject Application
                    </h5>

                    <textarea
                      rows="3"
                      value={rejectionReason}
                      onChange={(e) =>
                        setRejectionReason(
                          e.target.value,
                        )
                      }
                      placeholder="Enter reason for rejection..."
                      className="mt-3 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    />

                    <button
                      onClick={handleRejectTutor}
                      disabled={actionLoading}
                      className="mt-3 w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {actionLoading
                        ? "Rejecting..."
                        : "Reject Tutor"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold capitalize text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default TutorApplicationDetails;