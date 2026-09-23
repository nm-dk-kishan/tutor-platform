import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const TutorSearch = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    subject: "",
    class: "",
    city: "",
    teachingMode: "",
    minFee: "",
    maxFee: "",
    experience: "",
  });

  const fetchTutors = async (customFilters = filters) => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      Object.entries(customFilters).forEach(([key, value]) => {
        if (value.trim()) {
          params[key] = value.trim();
        }
      });

      const response = await api.get("/tutors", {
        params,
      });

      setTutors(response.data.tutors || []);
    } catch (error) {
      console.error("Fetch tutors error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load tutors"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTutors();
  };

  const handleClear = () => {
    const emptyFilters = {
      subject: "",
      class: "",
      city: "",
      teachingMode: "",
      minFee: "",
      maxFee: "",
      experience: "",
    };

    setFilters(emptyFilters);
    fetchTutors(emptyFilters);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Find a Tutor
          </h1>

          <p className="mt-2 text-slate-600">
            Find verified tutors based on your subject,
            class, location and budget.
          </p>
        </div>

        {/* Search Filters */}
        <form
          onSubmit={handleSearch}
          className="mb-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* Subject */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subject
              </label>

              <input
                type="text"
                name="subject"
                value={filters.subject}
                onChange={handleChange}
                placeholder="e.g. Mathematics"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Class */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Class
              </label>

              <input
                type="text"
                name="class"
                value={filters.class}
                onChange={handleChange}
                placeholder="e.g. 10"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                City
              </label>

              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleChange}
                placeholder="e.g. Lucknow"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Teaching Mode */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Teaching Mode
              </label>

              <select
                name="teachingMode"
                value={filters.teachingMode}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Any mode</option>
                <option value="online">Online</option>
                <option value="home">Home</option>
                <option value="both">Online + Home</option>
              </select>
            </div>

            {/* Minimum Fee */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Minimum Fee / Hour
              </label>

              <input
                type="number"
                name="minFee"
                value={filters.minFee}
                onChange={handleChange}
                placeholder="₹200"
                min="0"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Maximum Fee */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Maximum Fee / Hour
              </label>

              <input
                type="number"
                name="maxFee"
                value={filters.maxFee}
                onChange={handleChange}
                placeholder="₹1000"
                min="0"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Minimum Experience
              </label>

              <select
                name="experience"
                value={filters.experience}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Any experience</option>
                <option value="1">1+ year</option>
                <option value="2">2+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Search Tutors
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Clear
              </button>
            </div>
          </div>
        </form>

        {/* Results Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Available Tutors
            </h2>

            {!loading && (
              <p className="mt-1 text-sm text-slate-500">
                {tutors.length} tutor
                {tutors.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

            <p className="mt-4 text-slate-600">
              Finding tutors...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && tutors.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">
              No tutors found
            </h3>

            <p className="mt-2 text-slate-500">
              Try changing your search filters.
            </p>
          </div>
        )}

        {/* Tutor Cards */}
        {!loading && !error && tutors.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tutors.map((tutor) => (
              <div
                key={tutor._id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="p-6">

                  {/* Tutor Name */}
                  <h3 className="text-xl font-bold text-slate-900">
                    {tutor.user?.name || "Tutor"}
                  </h3>

                  {/* Domain */}
                  <p className="mt-1 font-medium text-indigo-600">
                    {tutor.customDomain || tutor.domain}
                  </p>

                  {/* Qualification */}
                  <p className="mt-4 text-sm text-slate-600">
                    {tutor.qualification}
                  </p>

                  {/* Experience */}
                  <p className="mt-2 text-sm text-slate-600">
                    {tutor.experience}{" "}
                    {tutor.experience === 1
                      ? "year"
                      : "years"}{" "}
                    experience
                  </p>

                  {/* Subjects */}
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Subjects
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects?.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Classes */}
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Classes
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {tutor.classes?.map((className) => (
                        <span
                          key={className}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          Class {className}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-600">
                      📍 {tutor.area}, {tutor.city}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Teaching:{" "}
                      <span className="font-medium capitalize">
                        {tutor.teachingMode}
                      </span>
                    </p>
                  </div>

                  {/* Fee */}
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-400">
                        Starting from
                      </p>

                      <p className="text-xl font-bold text-slate-900">
                        ₹{tutor.hourlyFee}
                        <span className="text-sm font-normal text-slate-500">
                          /hour
                        </span>
                      </p>
                    </div>

                    <Link
                        to={`/tutors/${tutor._id}`}
                        className="rounded-xl bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
                      >
                        View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorSearch;