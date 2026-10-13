
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function StudentAssignments() {
  // Store student's assignments
  const [assignments, setAssignments] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Store each assignment's answer and selected PDFs
  const [submissionDrafts, setSubmissionDrafts] = useState({});

  // Track the assignment currently being submitted
  const [submittingId, setSubmittingId] = useState("");

  // Load assignments when the page opens
  useEffect(() => {
    fetchAssignments();
  }, []);

  // ==========================================
  // GET STUDENT ASSIGNMENTS
  // ==========================================

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/assignments/student");

      if (response.data.success) {
        setAssignments(response.data.assignments || []);
      } else {
        setError(
          response.data.message || "Unable to load assignments."
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

  // ==========================================
  // UPDATE SUBMISSION DRAFT
  // ==========================================

  const updateSubmissionDraft = (assignmentId, updates) => {
    setSubmissionDrafts((previous) => ({
      ...previous,
      [assignmentId]: {
        text: previous[assignmentId]?.text || "",
        files: previous[assignmentId]?.files || [],
        ...updates,
      },
    }));
  };

  // ==========================================
  // SUBMIT ASSIGNMENT
  // ==========================================

  const handleSubmitAssignment = async (assignmentId) => {
    try {
      setError("");
      setSuccess("");

      const draft = submissionDrafts[assignmentId] || {
        text: "",
        files: [],
      };

      const text = draft.text.trim();
      const files = draft.files;

      // The student must provide text or at least one PDF
      if (!text && files.length === 0) {
        setError(
          "Write an answer or attach a PDF before submitting."
        );
        return;
      }

      setSubmittingId(assignmentId);

      // Build multipart data for the answer and PDF files
      const formData = new FormData();

      formData.append("text", text);

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      // Submit to the authenticated student endpoint
      const response = await api.post(
        `/assignments/${assignmentId}/submit`,
        formData
      );

      if (!response.data.success) {
        setError(
          response.data.message || "Unable to submit assignment."
        );
        return;
      }

      // Clear the draft after successful submission
      setSubmissionDrafts((previous) => ({
        ...previous,
        [assignmentId]: {
          text: "",
          files: [],
        },
      }));

      setSuccess("Assignment submitted successfully.");

      // Refresh assignment status and saved submission
      await fetchAssignments();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to submit assignment."
      );
    } finally {
      setSubmittingId("");
    }
  };

  // ==========================================
  // VALIDATE SELECTED PDF FILES
  // ==========================================

  const handleFileSelection = (assignmentId, event) => {
    const files = Array.from(event.target.files || []);

    // Allow up to three files
    if (files.length > 3) {
      setError("You can upload a maximum of 3 PDF files.");
      updateSubmissionDraft(assignmentId, { files: [] });
      event.target.value = "";
      return;
    }

    // Validate file extension, MIME type and size
    const invalidFile = files.find(
      (file) =>
        !/\.pdf$/i.test(file.name) ||
        file.type !== "application/pdf" ||
        file.size > 10 * 1024 * 1024
    );

    if (invalidFile) {
      setError(
        "Select PDF files only. Each file must be 10 MB or smaller."
      );

      updateSubmissionDraft(assignmentId, { files: [] });
      event.target.value = "";
      return;
    }

    setError("");
    updateSubmissionDraft(assignmentId, { files });
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

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

  // ==========================================
  // LOADING
  // ==========================================

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

  // ==========================================
  // MAIN UI
  // ==========================================

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
        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* Section heading */}
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
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Refresh
          </button>
        </section>

        {/* Empty state */}
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
            {assignments.map((assignment) => {
              const draft = submissionDrafts[assignment._id] || {
                text: "",
                files: [],
              };

              const isSubmitted = Boolean(
                assignment.submission?.submittedAt
              );

              return (
                <article
                  key={assignment._id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {/* Assignment header */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">
                        {assignment.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Tutor:{" "}
                        <span className="font-semibold text-slate-700">
                          {assignment.tutor?.user?.name || "Tutor"}
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

                  {/* Assignment instructions */}
                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-800">
                      Instructions
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {assignment.description}
                    </p>
                  </div>

                  {/* PDFs attached by tutor */}
                  {Array.isArray(assignment.attachments) &&
                    assignment.attachments.length > 0 && (
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="mb-3 text-sm font-semibold text-slate-800">
                          Files from your tutor
                        </p>

                        <ul className="space-y-2">
                          {assignment.attachments.map((file, index) => (
                            <li
                              key={file.publicId || file.url || index}
                            >
                              {file.url ? (
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                  📄{" "}
                                  {file.fileName ||
                                    `Assignment PDF ${index + 1}`}
                                </a>
                              ) : (
                                <span className="text-sm text-slate-500">
                                  {file.fileName ||
                                    `Assignment PDF ${index + 1}`}{" "}
                                  (link unavailable)
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Assignment dates */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <InfoCard
                      label="Due Date"
                      value={formatDate(assignment.dueDate)}
                    />

                    <InfoCard
                      label="Assigned On"
                      value={formatDate(assignment.createdAt)}
                    />
                  </div>

                  {/* Existing submission or submission form */}
                  {isSubmitted ? (
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

                      {/* Submitted text */}
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

                      {/* Submitted PDFs */}
                      {assignment.submission.attachments?.length > 0 && (
                        <div className="mt-3 rounded-xl bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Your submitted files
                          </p>

                          <ul className="mt-2 space-y-2">
                            {assignment.submission.attachments.map(
                              (file, index) => (
                                <li
                                  key={
                                    file.publicId ||
                                    file.fileUrl ||
                                    index
                                  }
                                >
                                  {file.fileUrl ? (
                                    <a
                                      href={file.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-sm font-medium text-indigo-600 hover:underline"
                                    >
                                      📄{" "}
                                      {file.fileName ||
                                        `Submission PDF ${index + 1}`}
                                    </a>
                                  ) : (
                                    <span className="text-sm text-slate-500">
                                      {file.fileName ||
                                        `Submission PDF ${index + 1}`}
                                    </span>
                                  )}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                      <p className="font-semibold text-indigo-900">
                        Submit your assignment
                      </p>

                      <p className="mt-1 text-sm text-indigo-700">
                        Write your answer or attach your completed work as
                        a PDF.
                      </p>

                      {/* Written answer */}
                      <label
                        htmlFor={`answer-${assignment._id}`}
                        className="mt-4 block text-sm font-medium text-slate-700"
                      >
                        Your Answer
                      </label>

                      <textarea
                        id={`answer-${assignment._id}`}
                        rows={4}
                        maxLength={5000}
                        value={draft.text}
                        onChange={(event) =>
                          updateSubmissionDraft(assignment._id, {
                            text: event.target.value,
                          })
                        }
                        placeholder="Write your answer here..."
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <p className="mt-1 text-right text-xs text-slate-500">
                        {draft.text.length}/5000 characters
                      </p>

                      {/* Select submission PDFs */}
                      <label
                        htmlFor={`files-${assignment._id}`}
                        className="mt-4 block text-sm font-medium text-slate-700"
                      >
                        Attach Completed Work (PDF)
                      </label>

                      <input
                        id={`files-${assignment._id}`}
                        type="file"
                        accept=".pdf,application/pdf"
                        multiple
                        onChange={(event) =>
                          handleFileSelection(
                            assignment._id,
                            event
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        PDF only · Maximum 3 files · 10 MB per file
                      </p>

                      {/* Selected PDF names */}
                      {draft.files.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {draft.files.map((file, index) => (
                            <li
                              key={`${file.name}-${index}`}
                              className="text-sm text-slate-700"
                            >
                              📄 {file.name}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Submit button */}
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            handleSubmitAssignment(assignment._id)
                          }
                          disabled={
                            submittingId === assignment._id
                          }
                          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submittingId === assignment._id
                            ? "Submitting..."
                            : "Submit Assignment"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tutor review */}
                  {assignment.review?.reviewedAt && (
                    <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
                      <p className="font-semibold text-green-900">
                        Tutor Feedback
                      </p>

                      <p className="mt-2 text-sm text-green-700">
                        Marks: {assignment.review.marks ?? "N/A"}
                      </p>

                      {assignment.review.feedback && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-green-700">
                          Feedback: {assignment.review.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

// ==========================================
// REUSABLE INFO CARD
// ==========================================

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
