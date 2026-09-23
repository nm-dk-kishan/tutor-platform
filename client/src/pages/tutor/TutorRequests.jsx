import { useEffect, useState } from "react";
import api from "../../services/api";

const TutorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tutor-requests/received");

      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("Fetch tutor requests error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load tutor requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      setActionLoading(requestId);
      setError("");

      const response = await api.patch(
        `/tutor-requests/${requestId}/${action}`
      );

      const updatedRequest = response.data.request;

      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          request._id === requestId
            ? {
                ...request,
                status: updatedRequest.status,
                respondedAt: updatedRequest.respondedAt,
              }
            : request
        )
      );
    } catch (error) {
      console.error(`Request ${action} error:`, error);

      setError(
        error.response?.data?.message ||
          `Unable to ${action} tutor request`
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading requests...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Student Requests
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage requests from students and parents.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty state */}
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">📭</div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No requests yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            New student or parent requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                {/* Student information */}
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                    {request.requester?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "S"}
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {request.requester?.name || "Unknown User"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {request.requester?.role === "parent"
                        ? "Parent"
                        : "Student"}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {request.requester?.email}
                    </p>

                    {request.requester?.phone && (
                      <p className="text-sm text-slate-600">
                        {request.requester.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    request.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : request.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)}
                </span>
              </div>

              {/* Message */}
              {request.message && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Message
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {request.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              {request.status === "pending" && (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={actionLoading === request._id}
                    onClick={() =>
                      handleAction(request._id, "accept")
                    }
                    className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading === request._id
                      ? "Processing..."
                      : "Accept Request"}
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading === request._id}
                    onClick={() =>
                      handleAction(request._id, "reject")
                    }
                    className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}

              {/* Completed status */}
              {request.status === "accepted" && (
                <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  ✓ You accepted this request.
                </div>
              )}

              {request.status === "rejected" && (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  This request was rejected.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorRequests;