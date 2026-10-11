import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function StudentAssignments() {
  // Store student's assignments
  const [assignments, setAssignments] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error message
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Get student assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/assignments/student"
      );

      if (response.data.success) {
        setAssignments(
          response.data.assignments || []
        );
      } else {
        setError(
          response.data.message ||
            "Unable to load assignments."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Status style
  const getStatusStyle = (status) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-700";

      case "submitted":
        return "bg-amber-100 text-amber-700";

      case "reviewed":
        return "bg-green-100 text-green-700";

      case "overdue":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-600">
            Loading assignments...
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
              Assignments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View assignments given by your tutors.
            </p>
          </div>

          <Link
            to="/student"
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

        <section className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              My Work
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Your assignments
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Complete and submit your assigned work.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAssignments}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </section>

        {assignments.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
              📝
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-950">
              No assignments
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Your tutor hasn't assigned any work yet.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {assignments.map((assignment) => (
              <article
                key={assignment._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">
                      {assignment.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Tutor:{" "}
                      <span className="font-semibold text-slate-700">
                        {assignment.tutor?.user?.name ||
                          "Tutor"}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusStyle(
                      assignment.status
                    )}`}
                  >
                    {assignment.status
                      ?.replaceAll("_", " ")
                      .replace(/\b\w/g, (letter) =>
                        letter.toUpperCase()
                      )}
                  </span>
                </div>

                {/* Description */}
                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-800">
                    Instructions
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {assignment.description}
                  </p>
                </div>

                {/* Details */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    label="Due Date"
                    value={formatDate(
                      assignment.dueDate
                    )}
                  />

                  <InfoCard
                    label="Assigned On"
                    value={formatDate(
                      assignment.createdAt
                    )}
                  />
                </div>

                {/* Existing submission */}
                {assignment.submission?.submittedAt ? (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="font-semibold text-amber-900">
                      Assignment submitted
                    </p>

                    <p className="mt-2 text-sm text-amber-700">
                      Submitted on{" "}
                      {formatDate(
                        assignment.submission.submittedAt
                      )}
                    </p>

                    {assignment.submission.text && (
                      <div className="mt-3 rounded-xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Your submission
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {assignment.submission.text}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                    <p className="font-semibold text-indigo-900">
                      This assignment is waiting for your
                      submission.
                    </p>

                    <p className="mt-1 text-sm text-indigo-700">
                      Submission functionality will be
                      available in the next step.
                    </p>
                  </div>
                )}

                {/* Review */}
                {assignment.review?.reviewedAt && (
                  <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
                    <p className="font-semibold text-green-900">
                      Tutor Feedback
                    </p>

                    <p className="mt-2 text-sm text-green-700">
                      Marks:{" "}
                      {assignment.review.marks ?? "N/A"}
                    </p>

                    {assignment.review.feedback && (
                      <p className="mt-2 text-sm text-green-700">
                        Feedback:{" "}
                        {assignment.review.feedback}
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

export default StudentAssignments;