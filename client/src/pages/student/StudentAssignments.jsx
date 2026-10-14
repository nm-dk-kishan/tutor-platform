import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AssignmentFileList from "../../components/common/AssignmentFileList";
import AssignmentNotifications from "../../components/common/AssignmentNotifications";
import api from "../../services/api";
import {
  getAssignmentDisplayStatus,
  getAssignmentSummary,
} from "../../utils/assignmentStatus";

const STATUS_OPTIONS = [
  ["all", "All statuses"],
  ["assigned", "Assigned"],
  ["submitted", "Submitted"],
  ["reviewed", "Reviewed"],
  ["overdue", "Overdue"],
];

const formatDate = (date) => {
  if (!date) return "Not specified";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Invalid date";
  return parsedDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

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

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [now, setNow] = useState(0);

  useEffect(() => {
    let active = true;

    const loadAssignments = async () => {
      try {
        const response = await api.get("/assignments/student");
        if (active && response.data.success) {
          setAssignments(response.data.assignments || []);
        } else if (active) {
          setError(response.data.message || "Unable to load assignments.");
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load assignments.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadAssignments();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const intervalId = window.setInterval(updateNow, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const summary = useMemo(
    () => getAssignmentSummary(assignments, now),
    [assignments, now],
  );

  const filteredAssignments = useMemo(() => {
    const query = searchText.trim().replace(/\s+/g, " ").toLowerCase();

    return assignments.filter((assignment) => {
      const tutorName = assignment.tutor?.user?.name || "";
      const matchesSearch =
        !query ||
        [assignment.title, assignment.description, tutorName]
          .filter(Boolean)
          .some((value) =>
            value.replace(/\s+/g, " ").trim().toLowerCase().includes(query),
          );
      const matchesStatus =
        statusFilter === "all" ||
        getAssignmentDisplayStatus(assignment, now) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assignments, now, searchText, statusFilter]);

  const updateDraft = (assignmentId, field, value) => {
    setDrafts((previous) => ({
      ...previous,
      [assignmentId]: {
        text: previous[assignmentId]?.text || "",
        files: previous[assignmentId]?.files || [],
        [field]: value,
      },
    }));
  };

  const selectFiles = (assignmentId, event) => {
    const files = Array.from(event.target.files || []);
    const invalidFile = files.find(
      (file) =>
        !/\.pdf$/i.test(file.name) ||
        (file.type && file.type !== "application/pdf") ||
        file.size > 10 * 1024 * 1024,
    );

    if (files.length > 3 || invalidFile) {
      setError(
        files.length > 3
          ? "You can upload a maximum of 3 PDF files."
          : "Select PDF files only. Each file must be 10 MB or smaller.",
      );
      event.target.value = "";
      updateDraft(assignmentId, "files", []);
      return;
    }

    setError("");
    updateDraft(assignmentId, "files", files);
  };

  const submitAssignment = async (assignment) => {
    const draft = drafts[assignment._id] || { text: "", files: [] };
    if (!draft.text.trim() && draft.files.length === 0) {
      setError("Write an answer or attach a PDF before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("text", draft.text.trim());
    draft.files.forEach((file) => formData.append("attachments", file));

    try {
      setError("");
      setSuccess("");
      setSubmittingId(assignment._id);

      const response = await api.post(
        `/assignments/${assignment._id}/submit`,
        formData,
      );
      if (!response.data.success) {
        setError(response.data.message || "Unable to submit assignment.");
        return;
      }

      setAssignments((previous) =>
        previous.map((item) =>
          item._id === assignment._id
            ? { ...item, ...response.data.assignment, tutor: item.tutor }
            : item,
        ),
      );
      setDrafts((previous) => {
        const next = { ...previous };
        delete next[assignment._id];
        return next;
      });
      setSuccess("Assignment submitted successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to submit assignment.",
      );
    } finally {
      setSubmittingId("");
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          <p className="mt-4 text-sm text-slate-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Student Portal
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              Assignments
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review your work, deadlines, and tutor feedback.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AssignmentNotifications />
            <Link
              to="/student"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        <section aria-label="Assignment performance summary" className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <SummaryCard label="Total" value={summary.total} />
          <SummaryCard label="Pending" value={summary.pending} />
          <SummaryCard label="Awaiting review" value={summary.submitted} />
          <SummaryCard label="Reviewed" value={summary.reviewed} />
          <SummaryCard label="Overdue" value={summary.overdue} />
          <SummaryCard
            label="Average marks"
            value={summary.averageMarks === null ? "N/A" : `${summary.averageMarks} / 100`}
          />
        </section>

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_14rem_auto] md:items-end">
            <div>
              <label htmlFor="student-assignment-search" className="mb-2 block text-sm font-medium text-slate-700">
                Search assignments
              </label>
              <input
                id="student-assignment-search"
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search title, description, or tutor"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label htmlFor="student-assignment-status" className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="student-assignment-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
              >
                {STATUS_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!searchText && statusFilter === "all"}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear filters
            </button>
          </div>
        </section>

        {assignments.length === 0 ? (
          <EmptyState message="Assignments from your tutors will appear here." />
        ) : filteredAssignments.length === 0 ? (
          <EmptyState message="No assignments match your search or status filter." onClear={clearFilters} />
        ) : (
          <div className="space-y-5">
            {filteredAssignments.map((assignment) => {
              const status = getAssignmentDisplayStatus(assignment, now);
              const submitted = Boolean(
                assignment.submission?.submittedAt ||
                  assignment.status === "submitted" ||
                  status === "reviewed",
              );
              const reviewed = status === "reviewed";
              const tutorName = assignment.tutor?.user?.name || "Your tutor";
              const draft = drafts[assignment._id] || { text: "", files: [] };

              return (
                <article key={assignment._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">{assignment.title}</h2>
                      <p className="mt-1 text-sm text-slate-500">Tutor: {tutorName}</p>
                    </div>
                    <span className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${getStatusStyle(status)}`}>
                      {status[0].toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <p className="mt-5 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-700">
                    {assignment.description}
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <SummaryCard label="Due date" value={formatDate(assignment.dueDate)} />
                    <SummaryCard label="Created" value={formatDate(assignment.createdAt)} />
                  </div>

                  <AssignmentFileList
                    title="Tutor-provided PDFs"
                    files={assignment.attachments}
                    assignmentId={assignment._id}
                    fileKind="assignment"
                  />

                  {status === "overdue" && !submitted && (
                    <div role="alert" className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-5 text-red-900">
                      <h3 className="font-bold">Deadline Passed</h3>
                      <p className="mt-1 text-sm">
                        The submission deadline for this assignment has passed. You can no longer submit this assignment.
                      </p>
                      <p className="mt-2 text-sm font-semibold">Deadline: {formatDate(assignment.dueDate)}</p>
                    </div>
                  )}

                  {submitted && (
                    <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                      <h3 className="font-semibold text-amber-950">Your submission</h3>
                      <p className="mt-2 text-xs text-amber-800">
                        Submitted: {formatDate(assignment.submission.submittedAt)}
                      </p>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                        {assignment.submission.text || "No written answer was provided."}
                      </p>
                      <AssignmentFileList
                        title="Your submitted PDFs"
                        files={assignment.submission.attachments}
                        assignmentId={assignment._id}
                        fileKind="submission"
                      />
                    </section>
                  )}

                  {!submitted && status !== "overdue" && (
                    <section className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                      <h3 className="font-semibold text-indigo-950">Submit your assignment</h3>
                      <label htmlFor={`submission-text-${assignment._id}`} className="mb-2 mt-4 block text-sm font-medium text-slate-700">
                        Written answer
                      </label>
                      <textarea
                        id={`submission-text-${assignment._id}`}
                        rows={5}
                        maxLength={5000}
                        value={draft.text}
                        onChange={(event) => updateDraft(assignment._id, "text", event.target.value)}
                        placeholder="Write your answer..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                      />
                      <label htmlFor={`submission-files-${assignment._id}`} className="mb-2 mt-4 block text-sm font-medium text-slate-700">
                        Attach PDF files (optional)
                      </label>
                      <input
                        id={`submission-files-${assignment._id}`}
                        type="file"
                        accept=".pdf,application/pdf"
                        multiple
                        onChange={(event) => selectFiles(assignment._id, event)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                      />
                      <p className="mt-2 text-xs text-slate-500">PDF only · Maximum 3 files · 10 MB per file</p>
                      {draft.files.length > 0 && (
                        <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                          {draft.files.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}
                        </ul>
                      )}
                      <button
                        type="button"
                        onClick={() => void submitAssignment(assignment)}
                        disabled={submittingId === assignment._id}
                        className="mt-4 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submittingId === assignment._id ? "Submitting..." : "Submit Assignment"}
                      </button>
                    </section>
                  )}

                  {reviewed && (
                    <section className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
                      <h3 className="font-semibold text-green-950">Assignment reviewed</h3>
                      <p className="mt-2 text-lg font-bold text-green-900">
                        Marks: {typeof assignment.review?.marks === "number" ? assignment.review.marks : "N/A"} / 100
                      </p>
                      {assignment.review?.feedback?.trim() && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-green-900">
                          {assignment.review.feedback}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-green-800">
                        Reviewed: {formatDate(assignment.review?.reviewedAt)}
                      </p>
                    </section>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({ message, onClear }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">No assignments found</h2>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Clear search and filters
        </button>
      )}
    </div>
  );
}

export default StudentAssignments;
