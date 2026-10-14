import { useCallback, useEffect, useMemo, useState } from "react";
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

function TutorAssignments() {
  // All assignments created by this tutor
  const [assignments, setAssignments] = useState([]);

  // Connected students
  const [students, setStudents] = useState([]);

  // Loading and action states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewingId, setReviewingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  // Error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create assignment form
  const [selectedStudent, setSelectedStudent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachments, setAttachments] = useState([]);

  // Grading form data, stored separately for each assignment
  const [reviewDrafts, setReviewDrafts] = useState({});
  // Assignment selected for deletion
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [now, setNow] = useState(0);

  // ==========================================
  // GET TUTOR ASSIGNMENTS
  // ==========================================
  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/assignments/tutor");

      if (response.data.success) {
        setAssignments(response.data.assignments || []);
      } else {
        setError(response.data.message || "Unable to load assignments.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // GET CONNECTED STUDENTS
  // ==========================================
  const fetchStudents = useCallback(async () => {
    try {
      const response = await api.get("/tutor-requests/students");

      if (response.data.success) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      console.error("Unable to load students:", error);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAssignments();
      void fetchStudents();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchAssignments, fetchStudents]);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const intervalId = window.setInterval(updateNow, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  // ==========================================
  // CREATE ASSIGNMENT
  // ==========================================
  const handleCreateAssignment = async () => {
    try {
      setError("");
      setSuccess("");

      if (!selectedStudent) {
        setError("Please select a student.");
        return;
      }

      if (!title.trim()) {
        setError("Please enter an assignment title.");
        return;
      }

      if (!description.trim()) {
        setError("Please enter the assignment description.");
        return;
      }

      if (title.trim().length > 200 || description.trim().length > 2000) {
        setError("The title or description exceeds the allowed length.");
        return;
      }

      if (dueDate) {
        const parsedDueDate = new Date(dueDate);
        if (
          Number.isNaN(parsedDueDate.getTime()) ||
          parsedDueDate.getTime() <= Date.now()
        ) {
          setError("Please select a valid future due date.");
          return;
        }
      }

      setSaving(true);

      // Build multipart form data
      const formData = new FormData();

      formData.append("studentId", selectedStudent);
      formData.append("title", title.trim());
      formData.append("description", description.trim());

      if (dueDate) {
        const parsedDueDate = new Date(dueDate);

        if (Number.isNaN(parsedDueDate.getTime())) {
          setError("Please enter a valid due date.");
          return;
        }

        formData.append("dueDate", parsedDueDate.toISOString());
      }

      // Add the selected PDF files
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await api.post("/assignments", formData);

      if (!response.data.success) {
        setError(response.data.message || "Unable to create assignment.");
        return;
      }

      setSuccess("Assignment created successfully.");

      // Clear the form
      setSelectedStudent("");
      setTitle("");
      setDescription("");
      setDueDate("");
      setAttachments([]);

      // Reload assignment history
      await fetchAssignments();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create assignment.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // UPDATE A GRADING DRAFT
  // ==========================================
  const updateReviewDraft = (assignmentId, field, value) => {
    setReviewDrafts((previous) => ({
      ...previous,
      [assignmentId]: {
        marks: previous[assignmentId]?.marks ?? "",
        feedback: previous[assignmentId]?.feedback ?? "",
        [field]: value,
      },
    }));
  };

  // ==========================================
  // REVIEW STUDENT SUBMISSION
  // ==========================================
  const handleReviewAssignment = async (assignmentId) => {
    const draft = reviewDrafts[assignmentId] || {
      marks: "",
      feedback: "",
    };

    const marks = Number(draft.marks);

    if (
      draft.marks === "" ||
      !Number.isFinite(marks) ||
      marks < 0 ||
      marks > 100
    ) {
      setError("Enter valid marks between 0 and 100.");
      return;
    }

    if ((draft.feedback || "").trim().length > 2000) {
      setError("Feedback cannot exceed 2000 characters.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setReviewingId(assignmentId);

      const response = await api.patch(`/assignments/${assignmentId}/review`, {
        marks,
        feedback: (draft.feedback || "").trim(),
      });

      if (!response.data.success) {
        setError(response.data.message || "Unable to submit review.");
        return;
      }

      await fetchAssignments();

      setReviewDrafts((previous) => {
        const updated = { ...previous };
        delete updated[assignmentId];
        return updated;
      });

      setSuccess("Assignment reviewed successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to submit review.");
    } finally {
      setReviewingId("");
    }
  };

  // ==========================================
  // DELETE ASSIGNMENT
  // ==========================================

  // Open our custom confirmation modal
  const handleDeleteAssignment = (assignment) => {
    setAssignmentToDelete(assignment);
  };

  // Delete the assignment after the user confirms
  const confirmDeleteAssignment = async () => {
    if (!assignmentToDelete || deletingId) return;

    const assignmentId = assignmentToDelete._id;

    try {
      setError("");
      setSuccess("");
      setDeletingId(assignmentId);

      const response = await api.delete(`/assignments/${assignmentId}`);

      if (!response.data.success) {
        setError(response.data.message || "Unable to delete assignment.");
        return;
      }

      // Remove the deleted assignment from the page
      setAssignments((previous) =>
        previous.filter((assignment) => assignment._id !== assignmentId),
      );

      // Remove any unsaved grading draft for this assignment
      setReviewDrafts((previous) => {
        const updated = { ...previous };
        delete updated[assignmentId];
        return updated;
      });

      // Close the modal and show success
      setAssignmentToDelete(null);
      setSuccess("Assignment deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete assignment.");
    } finally {
      setDeletingId("");
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "Not specified";

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

  const summary = useMemo(
    () => getAssignmentSummary(assignments, now),
    [assignments, now],
  );

  const filteredAssignments = useMemo(() => {
    const query = searchText.trim().replace(/\s+/g, " ").toLowerCase();

    return assignments.filter((assignment) => {
      const studentName = assignment.student?.name || "";
      const matchesSearch =
        !query ||
        [assignment.title, assignment.description, studentName]
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

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
  };

  // ==========================================
  // LOADING
  // ==========================================
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

  // ==========================================
  // MAIN UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Tutor Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              Assignments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create, review, and manage student assignments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AssignmentNotifications />
            <Link
              to="/tutor"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm font-medium text-green-700"
          >
            {success}
          </div>
        )}

        {/* ======================================
            CREATE ASSIGNMENT
        ====================================== */}
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              New Assignment
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Create assignment
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Assign homework or practice work to one of your active students.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Student */}
            <div>
              <label
                htmlFor="assignment-student"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Student
              </label>

              <select
                id="assignment-student"
                value={selectedStudent}
                onChange={(event) => setSelectedStudent(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select student</option>

                {students.map((item) => (
                  <option
                    key={item.student?._id}
                    value={item.student?._id || ""}
                  >
                    {item.student?.name || "Student"}
                  </option>
                ))}
              </select>

              {students.length === 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  No connected students were returned. Check your student
                  relationship endpoint if this is unexpected.
                </p>
              )}
            </div>

            {/* Due date */}
            <div>
              <label
                htmlFor="assignment-due-date"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Due Date
              </label>

              <input
                id="assignment-due-date"
                type="datetime-local"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label
                htmlFor="assignment-title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Assignment Title
              </label>

              <input
                id="assignment-title"
                type="text"
                maxLength={200}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Algebra Practice"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="assignment-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>

              <textarea
                id="assignment-description"
                rows={5}
                maxLength={2000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Write the assignment instructions..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* PDF attachments */}
            <div className="md:col-span-2">
              <label
                htmlFor="assignment-files"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Attach PDF Files (Optional)
              </label>

              <input
                id="assignment-files"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);

                  if (files.length > 3) {
                    setError("You can upload a maximum of 3 PDF files.");
                    setAttachments([]);
                    event.target.value = "";
                    return;
                  }

                  const invalidFile = files.find(
                    (file) =>
                      !/\.pdf$/i.test(file.name) ||
                      (file.type !== "" && file.type !== "application/pdf") ||
                      file.size > 10 * 1024 * 1024,
                  );

                  if (invalidFile) {
                    setError(
                      "Select PDF files only. Each file must be 10 MB or smaller.",
                    );
                    setAttachments([]);
                    event.target.value = "";
                    return;
                  }

                  setError("");
                  setAttachments(files);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
              />

              <p className="mt-2 text-xs text-slate-500">
                PDF only · Maximum 3 files · 10 MB per file
              </p>

              {attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="text-sm text-slate-700"
                    >
                      PDF: {file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleCreateAssignment}
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </section>

        {/* ======================================
            ASSIGNMENT HISTORY
        ====================================== */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold text-indigo-600">
              Assignment History
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Your assignments
            </h2>
          </div>

          <section
            aria-label="Assignment performance summary"
            className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6"
          >
            <InfoCard label="Total" value={summary.total} />
            <InfoCard label="Pending" value={summary.pending} />
            <InfoCard label="Awaiting review" value={summary.submitted} />
            <InfoCard label="Reviewed" value={summary.reviewed} />
            <InfoCard label="Overdue" value={summary.overdue} />
            <InfoCard
              label="Average marks"
              value={
                summary.averageMarks === null
                  ? "N/A"
                  : `${summary.averageMarks} / 100`
              }
            />
          </section>

          <div className="mb-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_14rem_auto] md:items-end">
            <div>
              <label
                htmlFor="tutor-assignment-search"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Search assignments
              </label>
              <input
                id="tutor-assignment-search"
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search title, description, or student"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label
                htmlFor="tutor-assignment-status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Status
              </label>
              <select
                id="tutor-assignment-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
              >
                {STATUS_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
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

          {assignments.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                📝
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-950">
                No assignments yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first assignment above.
              </p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-950">
                No assignments match these filters
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try another search or status, or clear the filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredAssignments.map((assignment) => {
                const hasSubmission = Boolean(
                  assignment.submission?.submittedAt,
                );

                const displayStatus = getAssignmentDisplayStatus(
                  assignment,
                  now,
                );
                const isReviewed = displayStatus === "reviewed";

                const draft = reviewDrafts[assignment._id] || {
                  marks: "",
                  feedback: "",
                };

                return (
                  <article
                    key={assignment._id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    {/* Assignment heading and actions */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-950">
                          {assignment.title}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          Student:{" "}
                          <span className="font-semibold text-slate-700">
                            {assignment.student?.name || "Student"}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusStyle(
                            displayStatus,
                          )}`}
                        >
                          {displayStatus
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(assignment)}
                          disabled={deletingId === assignment._id}
                          className="rounded-xl border border-red-200 bg-white
               px-4 py-2 text-sm font-semibold text-red-600
               transition hover:bg-red-50
               disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete Assignment
                        </button>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {assignment.description}
                      </p>
                    </div>

                    <AssignmentFileList
                      title="Assignment PDFs"
                      files={assignment.attachments}
                      assignmentId={assignment._id}
                      fileKind="assignment"
                    />

                    {/* Dates */}
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <InfoCard
                        label="Due Date"
                        value={formatDate(assignment.dueDate)}
                      />

                      <InfoCard
                        label="Created"
                        value={formatDate(assignment.createdAt)}
                      />
                    </div>

                    {displayStatus === "overdue" && !hasSubmission && (
                      <div
                        role="alert"
                        className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900"
                      >
                        <strong>Deadline Passed</strong>
                        <p className="mt-1">
                          The student did not submit this assignment before{" "}
                          {formatDate(assignment.dueDate)}.
                        </p>
                      </div>
                    )}

                    {/* ==================================
                        STUDENT SUBMISSION
                    ================================== */}
                    {hasSubmission ? (
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <h4 className="font-semibold text-amber-900">
                          Student Submission
                        </h4>

                        <p className="mt-2 text-sm text-amber-800">
                          Submitted on:{" "}
                          {formatDate(assignment.submission.submittedAt)}
                        </p>

                        {/* Student's written answer */}
                        <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4">
                          <p className="mb-2 text-sm font-semibold text-slate-800">
                            Student's Answer
                          </p>

                          {assignment.submission.text ? (
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                              {assignment.submission.text}
                            </p>
                          ) : (
                            <p className="text-sm italic text-slate-500">
                              No written answer was provided.
                            </p>
                          )}
                        </div>

                        <AssignmentFileList
                          title="Student's submitted PDFs"
                          files={assignment.submission.attachments}
                          assignmentId={assignment._id}
                          fileKind="submission"
                        />
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm text-slate-600">
                          Waiting for the student to submit this assignment.
                        </p>
                      </div>
                    )}

                    {/* ==================================
                        GRADING FORM
                    ================================== */}
                    {hasSubmission && !isReviewed && (
                      <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                        <h4 className="font-semibold text-indigo-900">
                          Review Student Submission
                        </h4>

                        <p className="mt-1 text-sm text-indigo-800">
                          Check the written answer and attached PDFs before
                          grading.
                        </p>

                        <div className="mt-4">
                          <label
                            htmlFor={`marks-${assignment._id}`}
                            className="mb-2 block text-sm font-medium text-slate-700"
                          >
                            Marks (0–100)
                          </label>

                          <input
                            id={`marks-${assignment._id}`}
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            value={draft.marks}
                            onChange={(event) =>
                              updateReviewDraft(
                                assignment._id,
                                "marks",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                            placeholder="Enter marks"
                          />
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor={`feedback-${assignment._id}`}
                            className="mb-2 block text-sm font-medium text-slate-700"
                          >
                            Feedback
                          </label>

                          <textarea
                            id={`feedback-${assignment._id}`}
                            rows={4}
                            maxLength={2000}
                            value={draft.feedback}
                            onChange={(event) =>
                              updateReviewDraft(
                                assignment._id,
                                "feedback",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                            placeholder="Write feedback for the student..."
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleReviewAssignment(assignment._id)}
                          disabled={reviewingId === assignment._id}
                          className="mt-4 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {reviewingId === assignment._id
                            ? "Submitting Review..."
                            : "Submit Review"}
                        </button>
                      </div>
                    )}

                    {/* ==================================
                        SAVED REVIEW
                    ================================== */}
                    {isReviewed && (
                      <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
                        <h4 className="font-semibold text-green-900">
                          Assignment Reviewed
                        </h4>

                        <p className="mt-2 text-sm text-green-800">
                          Marks: {assignment.review.marks ?? "N/A"} / 100
                        </p>

                        <p className="mt-1 text-sm text-green-800">
                          Reviewed on:{" "}
                          {formatDate(assignment.review.reviewedAt)}
                        </p>

                        <div className="mt-3 rounded-xl bg-white p-4">
                          <p className="mb-1 text-sm font-semibold text-slate-800">
                            Tutor Feedback
                          </p>

                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {assignment.review.feedback ||
                              "No written feedback provided."}
                          </p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Custom Delete Confirmation Modal */}
      {assignmentToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!deletingId) {
              setAssignmentToDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7 text-red-600"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                />
              </svg>
            </div>

            <h2
              id="delete-modal-title"
              className="text-xl font-bold text-slate-900"
            >
              Delete assignment?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                {assignmentToDelete.title}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The student will no longer be able to access this assignment. This
              action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setAssignmentToDelete(null)}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={confirmDeleteAssignment}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId ? "Deleting..." : "Delete Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// REUSABLE INFORMATION CARD
// ==========================================
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

export default TutorAssignments;
