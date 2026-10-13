import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function TutorAssignments() {
  // All assignments created by this tutor
  const [assignments, setAssignments] = useState([]);

  // Connected students
  const [students, setStudents] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Error/success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create-assignment form
  const [selectedStudent, setSelectedStudent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachments, setAttachments] = useState([]);

  // Load data when page opens
  useEffect(() => {
    fetchAssignments();
    fetchStudents();
  }, []);

  // ==========================================
  // GET TUTOR ASSIGNMENTS
  // ==========================================

  const fetchAssignments = async () => {
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
  };

  // ==========================================
  // GET CONNECTED STUDENTS
  // ==========================================

  const fetchStudents = async () => {
    try {
      const response = await api.get("/tutor-requests/students");

      if (response.data.success) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      console.error("Unable to load students:", error);
    }
  };

  // ==========================================
  // CREATE ASSIGNMENT
  // ==========================================

  const handleCreateAssignment = async () => {
    try {
      setError("");
      setSuccess("");

      // Validate student
      if (!selectedStudent) {
        setError("Please select a student.");
        return;
      }

      // Validate title
      if (!title.trim()) {
        setError("Please enter an assignment title.");
        return;
      }

      // Validate description
      if (!description.trim()) {
        setError("Please enter the assignment description.");
        return;
      }

      setSaving(true);

      // Create multipart form data
      const formData = new FormData();

      formData.append("studentId", selectedStudent);
      formData.append("title", title.trim());
      formData.append("description", description.trim());

      // Add due date if entered
      if (dueDate) {
        const parsedDueDate = new Date(dueDate);

        if (Number.isNaN(parsedDueDate.getTime())) {
          setError("Please enter a valid due date.");
          return;
        }

        formData.append("dueDate", parsedDueDate.toISOString());
      }

      // Add selected PDF files
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      // Send one request to the backend
      // Axios should set the multipart Content-Type boundary.
      const response = await api.post("/assignments", formData);

      if (!response.data.success) {
        setError(response.data.message || "Unable to create assignment.");
        return;
      }

      // Show success
      setSuccess("Assignment created successfully.");

      // Clear form
      setSelectedStudent("");
      setTitle("");
      setDescription("");
      setDueDate("");
      setAttachments([]);

      // Reload assignments
      await fetchAssignments();
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create assignment.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    return new Date(date).toLocaleString("en-IN", {
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Tutor Portal
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              Assignments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage assignments for your students.
            </p>
          </div>

          <Link
            to="/tutor"
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

        {/* Success */}
        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* Create Assignment */}
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
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Student
              </label>

              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select student</option>

                {students.map((item) => (
                  <option key={item.student?._id} value={item.student?._id}>
                    {item.student?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Due Date
              </label>

              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Assignment Title */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Assignment Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Algebra Practice"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write the assignment instructions..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* PDF Attachments */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Attach PDF Files (Optional)
              </label>

              <input
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);

                  // Maximum 3 files
                  if (files.length > 3) {
                    setError("You can upload a maximum of 3 PDF files.");

                    setAttachments([]);
                    e.target.value = "";
                    return;
                  }

                  // Validate file extension, MIME type and size
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
                    e.target.value = "";
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

              {/* Selected file names */}
              {attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="text-sm text-slate-700"
                    >
                      📄 {file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Create Button */}
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

        {/* Existing Assignments */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold text-indigo-600">
              Assignment History
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Your assignments
            </h2>
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
          ) : (
            <div className="space-y-5">
              {assignments.map((assignment) => (
                <article
                  key={assignment._id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  {/* Assignment header */}
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

                    <span
                      className={`rounded-full px-4 py-2 text-xs font-semibold ${getStatusStyle(
                        assignment.status,
                      )}`}
                    >
                      {assignment.status
                        ?.replaceAll("_", " ")
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </span>
                  </div>

                  {/* Assignment description */}
                  <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                    <p className="text-sm leading-6 text-slate-700">
                      {assignment.description}
                    </p>
                  </div>

                  {/* Uploaded PDF attachments */}
                  {Array.isArray(assignment.attachments) &&
                    assignment.attachments.length > 0 && (
                      <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                        <p className="mb-3 text-sm font-semibold text-slate-800">
                          Attached PDFs
                        </p>

                        <ul className="space-y-2">
                          {assignment.attachments.map((file, index) => (
                            <li key={file.publicId || file.url || index}>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                              >
                                📄{" "}
                                {file.fileName || `Assignment PDF ${index + 1}`}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Due date and creation date */}
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

                  {/* Submission status */}

                  {/* Student submission */}
                  {assignment.submission?.submittedAt && (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                      <p className="font-semibold text-amber-900">
                        Student has submitted the assignment.
                      </p>

                      <p className="mt-2 text-sm text-amber-700">
                        Submitted on{" "}
                        {formatDate(assignment.submission.submittedAt)}
                      </p>

                      {/* Student's written answer */}
                      {assignment.submission.text && (
                        <div className="mt-4 rounded-xl bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Student's Answer
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {assignment.submission.text}
                          </p>
                        </div>
                      )}

                      {/* PDFs submitted by the student */}
                      {assignment.submission.attachments?.length > 0 && (
                        <div className="mt-4 rounded-xl bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Student's Submitted Files
                          </p>

                          <ul className="mt-3 space-y-2">
                            {assignment.submission.attachments.map(
                              (file, index) => (
                                <li
                                  key={file.publicId || file.fileUrl || index}
                                >
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
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review */}
                  {assignment.review?.reviewedAt && (
                    <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
                      <p className="font-semibold text-green-900">
                        Assignment reviewed
                      </p>

                      <p className="mt-2 text-sm text-green-700">
                        Marks: {assignment.review.marks ?? "N/A"}
                      </p>

                      {assignment.review.feedback && (
                        <p className="mt-1 text-sm text-green-700">
                          Feedback: {assignment.review.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
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

      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default TutorAssignments;
