import { useEffect, useState } from "react";
import api from "../../services/api";

const TutorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tutor-requests/students");

      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Fetch students error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your students"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading students...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Students
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage the students currently learning with you.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty state */}
      {students.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">👨‍🎓</div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No students yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Students who join your classes will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {students.map((relationship) => {
            const student = relationship.student;

            return (
              <div
                key={relationship._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* Student */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
                    {student?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "S"}
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {student?.name || "Student"}
                    </h2>

                    <p className="mt-1 text-sm capitalize text-slate-500">
                      {student?.role || "student"}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="mt-5 space-y-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm text-slate-700">
                      {student?.email || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {student?.phone || "Not available"}
                    </p>
                  </div>
                </div>

                {/* Relationship */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-semibold capitalize text-green-600">
                      {relationship.status}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Started
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {relationship.startedAt
                        ? new Date(
                            relationship.startedAt
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TutorStudents;