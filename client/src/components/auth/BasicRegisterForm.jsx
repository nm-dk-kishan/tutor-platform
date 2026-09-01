import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

import Button from "../common/Button";

function BasicRegisterForm({
  role,
  onBack,
  onSubmit,
  loading,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const roleTitles = {
    student: "Create your student account",
    parent: "Create your parent account",
    school: "Register your school / college",
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      ...formData,
      role,
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={17} />
        Change account type
      </button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {roleTitles[role]}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Enter your basic account information to get started.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
        <div>
          <label className="text-sm font-medium text-slate-700">
            {role === "school"
              ? "Institution name"
              : "Full name"}
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={
              role === "school"
                ? "ABC Public School"
                : "Your full name"
            }
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Phone number
          </label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="9876543210"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Password
          </label>

          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              minLength={6}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full gap-2"
        >
          {loading && (
            <Loader2
              size={18}
              className="animate-spin"
            />
          )}

          {loading
            ? "Creating account..."
            : "Create account"}
        </Button>
      </form>
    </div>
  );
}

export default BasicRegisterForm;