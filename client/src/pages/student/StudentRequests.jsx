import { useEffect, useState } from "react";
import api from "../../services/api";

const StudentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tutor-requests/my");

      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("Fetch my tutor requests error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your tutor requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "cancelled":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "accepted":
        return "✓ Your tutor request has been accepted.";

      case "rejected":
        return "This tutor request was rejected.";

      case "cancelled":
        return "This tutor request was cancelled.";

      default:
        return "Your request is waiting for the tutor's response.";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading your tutor requests...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Tutor Requests
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track the tutor requests you have sent.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">🔍</div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No tutor requests yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Find a tutor and send your first request.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const tutor = request.tutor;
            const tutorUser = tutor?.user;

            return (
              <div
                key={request._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {/* Tutor Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
                      {tutorUser?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "T"}
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {tutorUser?.name || "Tutor"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {tutor?.domain || "Tutor"}
                      </p>

                      {tutor?.city && (
                        <p className="mt-1 text-sm text-slate-500">
                          📍 {tutor.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>

                {/* Tutor Details */}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Subjects
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {tutor?.subjects?.join(", ") || "Not specified"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Classes
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {tutor?.classes?.join(", ") || "Not specified"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Fee
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {tutor?.hourlyFee
                        ? `₹${tutor.hourlyFee}/hour`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Request Message */}
                {request.message && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Your Message
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {request.message}
                    </p>
                  </div>
                )}

                {/* Status Message */}
                <div
                  className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${
                    request.status === "accepted"
                      ? "bg-green-50 text-green-700"
                      : request.status === "rejected"
                      ? "bg-red-50 text-red-700"
                      : request.status === "cancelled"
                      ? "bg-slate-50 text-slate-600"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {getStatusMessage(request.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentRequests;