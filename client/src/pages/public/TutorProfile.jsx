import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

const TutorProfile = () => {
  const { id } = useParams();

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tutor request states
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [message, setMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  // --------------------------------
  // Fetch tutor
  // --------------------------------
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/tutors/${id}`);

        setTutor(response.data.tutor);
      } catch (error) {
        console.error("Fetch tutor profile error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load tutor profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id]);

  // --------------------------------
  // Open request form
  // --------------------------------
  const handleOpenRequest = () => {
    setRequestError("");
    setRequestSuccess("");
    setShowRequestForm(true);
  };

  // --------------------------------
  // Send tutor request
  // --------------------------------
  const handleSendRequest = async (e) => {
    e.preventDefault();

    try {
      setRequestLoading(true);
      setRequestError("");
      setRequestSuccess("");

      const response = await api.post("/tutor-requests", {
        tutorId: tutor._id,
        message: message.trim(),
      });

      setRequestSuccess(
        response.data.message ||
          "Tutor request sent successfully"
      );

      setMessage("");
      setShowRequestForm(false);
    } catch (error) {
      console.error("Send tutor request error:", error);

      setRequestError(
        error.response?.data?.message ||
          "Unable to send tutor request"
      );
    } finally {
      setRequestLoading(false);
    }
  };

  // --------------------------------
  // Loading
  // --------------------------------
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-slate-600">
            Loading tutor profile...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------
  // Error
  // --------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">
            Tutor Not Found
          </h1>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <Link
            to="/tutors"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Back to Tutors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          to="/tutors"
          className="mb-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Back to Tutors
        </Link>

        {/* Main Profile */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-10 text-white">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-3xl font-bold text-indigo-600 shadow-lg">
                {tutor.user?.name?.charAt(0)?.toUpperCase() || "T"}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">
                    {tutor.user?.name || "Tutor"}
                  </h1>

                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    ✓ Verified Tutor
                  </span>
                </div>

                <p className="mt-2 text-lg text-indigo-100">
                  {tutor.customDomain || tutor.domain}
                </p>

                <p className="mt-2 text-sm text-indigo-100">
                  📍 {tutor.area}, {tutor.city}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-8 p-8 lg:grid-cols-3">

            {/* Left */}
            <div className="lg:col-span-2">

              {/* About */}
              <section>
                <h2 className="text-xl font-bold text-slate-900">
                  About the Tutor
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {tutor.bio}
                </p>
              </section>

              {/* Qualification */}
              <section className="mt-8">
                <h2 className="text-xl font-bold text-slate-900">
                  Qualification & Experience
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Qualification
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {tutor.qualification}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Institution
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {tutor.institution}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Experience
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {tutor.experience}{" "}
                      {tutor.experience === 1
                        ? "year"
                        : "years"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Teaching Mode
                    </p>

                    <p className="mt-1 font-semibold capitalize text-slate-900">
                      {tutor.teachingMode}
                    </p>
                  </div>
                </div>
              </section>

              {/* Subjects */}
              <section className="mt-8">
                <h2 className="text-xl font-bold text-slate-900">
                  Subjects
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tutor.subjects?.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </section>

              {/* Classes */}
              <section className="mt-8">
                <h2 className="text-xl font-bold text-slate-900">
                  Classes
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tutor.classes?.map((className) => (
                    <span
                      key={className}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      Class {className}
                    </span>
                  ))}
                </div>
              </section>

              {/* Availability */}
              {tutor.availability?.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-xl font-bold text-slate-900">
                    Availability
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {tutor.availability.map((slot) => (
                      <span
                        key={slot}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right */}
            <div>
              <div className="sticky top-6 rounded-2xl border border-slate-200 p-6">

                {/* Hourly Fee */}
                <p className="text-sm text-slate-500">
                  Hourly Fee
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  ₹{tutor.hourlyFee}
                  <span className="text-sm font-normal text-slate-500">
                    /hour
                  </span>
                </p>

                <div className="my-6 h-px bg-slate-200" />

                {/* Location */}
                <p className="text-sm text-slate-500">
                  Location
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {tutor.area}, {tutor.city}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Pincode: {tutor.pincode}
                </p>

                <div className="my-6 h-px bg-slate-200" />

                {/* Teaching Mode */}
                <p className="text-sm text-slate-500">
                  Teaching Mode
                </p>

                <p className="mt-1 font-semibold capitalize text-slate-900">
                  {tutor.teachingMode}
                </p>

                {/* Request Error */}
                {requestError && (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {requestError}
                  </div>
                )}

                {/* Request Success */}
                {requestSuccess && (
                  <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                    ✓ {requestSuccess}
                  </div>
                )}

                {/* Send Request Button */}
                {!showRequestForm && !requestSuccess && (
                  <button
                    type="button"
                    onClick={handleOpenRequest}
                    className="mt-8 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Send Tutor Request
                  </button>
                )}

                {/* Request Form */}
                {showRequestForm && !requestSuccess && (
                  <form
                    onSubmit={handleSendRequest}
                    className="mt-8"
                  >
                    <h3 className="text-lg font-bold text-slate-900">
                      Request This Tutor
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Tell the tutor what you need help with.
                    </p>

                    <textarea
                      value={message}
                      onChange={(e) =>
                        setMessage(e.target.value)
                      }
                      rows={5}
                      maxLength={500}
                      placeholder="Example: I need Mathematics tuition for Class 10."
                      className="mt-4 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                    <p className="mt-1 text-right text-xs text-slate-400">
                      {message.length}/500
                    </p>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="submit"
                        disabled={requestLoading}
                        className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {requestLoading
                          ? "Sending..."
                          : "Send Request"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowRequestForm(false);
                          setRequestError("");
                        }}
                        className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Request Sent State */}
                {requestSuccess && (
                  <button
                    type="button"
                    disabled
                    className="mt-4 w-full cursor-not-allowed rounded-xl bg-green-100 px-5 py-3 font-semibold text-green-700"
                  >
                    ✓ Request Sent
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;