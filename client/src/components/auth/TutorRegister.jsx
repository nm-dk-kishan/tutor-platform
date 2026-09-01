import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Loader2,
} from "lucide-react";

const steps = [
  "Basic",
  "Professional",
  "Teaching",
  "Location & Fees",
  "Review",
];

const domains = [
  ["mathematics", "Mathematics"],
  ["science", "Science"],
  ["physics", "Physics"],
  ["chemistry", "Chemistry"],
  ["biology", "Biology"],
  ["computer-science", "Computer Science"],
  ["english", "English"],
  ["commerce", "Commerce"],
  ["other", "Other"],
];

const subjectsByDomain = {
  mathematics: [
    "Mathematics",
    "Advanced Mathematics",
    "Applied Mathematics",
  ],
  science: [
    "General Science",
    "Physics",
    "Chemistry",
    "Biology",
  ],
  physics: ["Physics"],
  chemistry: ["Chemistry"],
  biology: ["Biology"],
  "computer-science": [
    "Computer Science",
    "Programming",
    "C++",
    "Java",
    "Python",
    "JavaScript",
    "Web Development",
  ],
  english: [
    "English",
    "Grammar",
    "Spoken English",
    "Literature",
  ],
  commerce: [
    "Accountancy",
    "Business Studies",
    "Economics",
  ],
};

const classOptions = [
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "College",
  "Competitive Exams",
];

function TutorRegister({ onBack, onSubmit }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",

    qualification: "",
    institution: "",
    experience: "",
    bio: "",

    domain: "",
    customDomain: "",
    subjects: [],
    classes: [],
    teachingMode: "",

    city: "",
    area: "",
    pincode: "",
    hourlyFee: "",
    availability: [],

    latitude: "",
    longitude: "",
  });

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const toggleArrayValue = (field, value) => {
    setFormData((previous) => {
      const currentValues = previous[field];

      return {
        ...previous,
        [field]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 0) {
      if (!formData.name.trim()) {
        newErrors.name = "Full name is required";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = "Enter a valid email address";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = "Enter a valid 10-digit phone number";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password =
          "Password must be at least 6 characters";
      }
    }

    if (currentStep === 1) {
      if (!formData.qualification.trim()) {
        newErrors.qualification =
          "Qualification is required";
      }

      if (!formData.institution.trim()) {
        newErrors.institution =
          "College / University is required";
      }

      if (formData.experience === "") {
        newErrors.experience =
          "Teaching experience is required";
      } else if (
        Number(formData.experience) < 0 ||
        Number(formData.experience) > 60
      ) {
        newErrors.experience =
          "Enter a valid experience value";
      }

      if (!formData.bio.trim()) {
        newErrors.bio = "Please add a short professional bio";
      }
    }

    if (currentStep === 2) {
      if (!formData.domain) {
        newErrors.domain = "Select your teaching domain";
      }

      if (
        formData.domain === "other" &&
        !formData.customDomain.trim()
      ) {
        newErrors.customDomain =
          "Tell us what you want to teach";
      }

      if (formData.subjects.length === 0) {
        newErrors.subjects =
          "Select at least one subject";
      }

      if (formData.classes.length === 0) {
        newErrors.classes =
          "Select at least one class";
      }

      if (!formData.teachingMode) {
        newErrors.teachingMode =
          "Select your teaching mode";
      }
    }

    if (currentStep === 3) {
      if (!formData.city.trim()) {
        newErrors.city = "City is required";
      }

      if (!formData.area.trim()) {
        newErrors.area = "Area is required";
      }

      if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode =
          "Pincode must contain exactly 6 digits";
      } else if (/^(\d)\1{5}$/.test(formData.pincode)) {
        newErrors.pincode =
          "Enter a valid pincode";
      }

      if (
        !formData.hourlyFee ||
        Number(formData.hourlyFee) <= 0
      ) {
        newErrors.hourlyFee =
          "Enter a valid hourly fee";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((previous) => previous + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const previousStep = () => {
    setErrors({});

    if (currentStep > 0) {
      setCurrentStep((previous) => previous - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors({
        location:
          "Location is not supported by your browser.",
      });
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField(
          "latitude",
          position.coords.latitude.toString(),
        );

        updateField(
          "longitude",
          position.coords.longitude.toString(),
        );

        setLocationLoading(false);
        setErrors((previous) => ({
          ...previous,
          location: "",
        }));
      },
      () => {
        setLocationLoading(false);

        setErrors({
          location:
            "Unable to access your location. Please allow location permission.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setSubmitting(true);

      await onSubmit({
        ...formData,
        role: "tutor",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Change account type
        </button>

        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Create your Tutor profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Tell students and parents about your teaching expertise.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const completed = index < currentStep;
            const active = index === currentStep;

            return (
              <div
                key={step}
                className="flex flex-1 items-center"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      completed || active
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {completed ? (
                      <Check size={16} />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <span
                    className={`mt-2 hidden text-xs sm:block ${
                      active
                        ? "font-semibold text-indigo-600"
                        : "text-slate-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-px flex-1 ${
                      index < currentStep
                        ? "bg-indigo-600"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[350px]">
        {currentStep === 0 && (
          <BasicStep
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
        )}

        {currentStep === 1 && (
          <ProfessionalStep
            formData={formData}
            updateField={updateField}
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <TeachingStep
            formData={formData}
            updateField={updateField}
            toggleArrayValue={toggleArrayValue}
            errors={errors}
          />
        )}

        {currentStep === 3 && (
          <LocationStep
            formData={formData}
            updateField={updateField}
            useCurrentLocation={useCurrentLocation}
            locationLoading={locationLoading}
            errors={errors}
          />
        )}

        {currentStep === 4 && (
          <ReviewStep formData={formData} />
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={previousStep}
          disabled={currentStep === 0 || submitting}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:invisible"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Continue
            <ArrowRight size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Submitting...
              </>
            ) : (
              <>
                Submit for verification
                <Check size={17} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ================= STEP 1 ================= */

function BasicStep({ formData, updateField, errors }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-950">
        Basic information
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Start with your basic account details.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Input
          label="Full name"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Your full name"
          error={errors.name}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => updateField("email", value)}
          placeholder="you@example.com"
          error={errors.email}
        />

        <Input
          label="Phone"
          value={formData.phone}
          onChange={(value) => updateField("phone", value)}
          placeholder="9876543210"
          maxLength={10}
          error={errors.phone}
        />

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(value) =>
            updateField("password", value)
          }
          placeholder="At least 6 characters"
          error={errors.password}
        />
      </div>
    </div>
  );
}

/* ================= STEP 2 ================= */

function ProfessionalStep({
  formData,
  updateField,
  errors,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-950">
        Professional information
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Help students understand your professional background.
      </p>

      <div className="mt-6 space-y-5">
        <Input
          label="Highest qualification"
          value={formData.qualification}
          onChange={(value) =>
            updateField("qualification", value)
          }
          placeholder="B.Tech, M.Sc, B.Ed..."
          error={errors.qualification}
        />

        <Input
          label="College / University"
          value={formData.institution}
          onChange={(value) =>
            updateField("institution", value)
          }
          placeholder="Institution name"
          error={errors.institution}
        />

        <Input
          label="Years of teaching experience"
          type="number"
          value={formData.experience}
          onChange={(value) =>
            updateField("experience", value)
          }
          placeholder="e.g. 3"
          error={errors.experience}
        />

        <div>
          <label className="text-sm font-medium text-slate-700">
            Professional bio
          </label>

          <textarea
            value={formData.bio}
            onChange={(event) =>
              updateField("bio", event.target.value)
            }
            rows={5}
            placeholder="Tell students about your teaching experience and approach..."
            className={`mt-2 w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition ${
              errors.bio
                ? "border-red-400"
                : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            }`}
          />

          {errors.bio && (
            <ErrorText message={errors.bio} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= STEP 3 ================= */

function TeachingStep({
  formData,
  updateField,
  toggleArrayValue,
  errors,
}) {
  const subjects =
    subjectsByDomain[formData.domain] || [];

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-950">
        Teaching details
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Tell students exactly what you teach.
      </p>

      <div className="mt-6 space-y-6">
        {/* Domain */}
        <div>
          <label className="text-sm font-medium text-slate-700">
            Primary teaching domain
          </label>

          <select
            value={formData.domain}
            onChange={(event) => {
              updateField("domain", event.target.value);
              updateField("subjects", []);
            }}
            className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${
              errors.domain
                ? "border-red-400"
                : "border-slate-200"
            }`}
          >
            <option value="">Select domain</option>

            {domains.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {errors.domain && (
            <ErrorText message={errors.domain} />
          )}
        </div>

        {/* Other */}
        {formData.domain === "other" && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <label className="text-sm font-semibold text-indigo-900">
              What do you want to teach?
            </label>

            <p className="mt-1 text-xs text-indigo-700">
              Enter the subject or teaching area you specialize in.
            </p>

            <input
              value={formData.customDomain}
              onChange={(event) =>
                updateField(
                  "customDomain",
                  event.target.value,
                )
              }
              placeholder="e.g. Guitar, Drawing, French..."
              className={`mt-3 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 ${
                errors.customDomain
                  ? "border-red-400"
                  : "border-slate-200"
              }`}
            />

            {errors.customDomain && (
              <ErrorText message={errors.customDomain} />
            )}
          </div>
        )}

        {/* Subjects */}
        {formData.domain && (
          <div>
            <label className="text-sm font-medium text-slate-700">
              Subjects you teach
            </label>

            {subjects.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {subjects.map((subject) => {
                  const selected =
                    formData.subjects.includes(subject);

                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() =>
                        toggleArrayValue(
                          "subjects",
                          subject,
                        )
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        selected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                      }`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            ) : (
              <Input
                label=""
                value={formData.customDomain}
                onChange={(value) =>
                  updateField("customDomain", value)
                }
                placeholder="Enter your subject"
              />
            )}

            {errors.subjects && (
              <ErrorText message={errors.subjects} />
            )}
          </div>
        )}

        {/* Classes */}
        <div>
          <label className="text-sm font-medium text-slate-700">
            Classes / students you teach
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {classOptions.map((item) => {
              const selected =
                formData.classes.includes(item);

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    toggleArrayValue("classes", item)
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {errors.classes && (
            <ErrorText message={errors.classes} />
          )}
        </div>

        {/* Mode */}
        <div>
          <label className="text-sm font-medium text-slate-700">
            Teaching mode
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["online", "Online"],
              ["home", "Home Tuition"],
              ["both", "Online + Home"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  updateField("teachingMode", value)
                }
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  formData.teachingMode === value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {errors.teachingMode && (
            <ErrorText message={errors.teachingMode} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= STEP 4 ================= */

function LocationStep({
  formData,
  updateField,
  useCurrentLocation,
  locationLoading,
  errors,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-950">
        Location & fees
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Help nearby students discover you.
      </p>

      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locationLoading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-60"
      >
        {locationLoading ? (
          <>
            <Loader2
              size={18}
              className="animate-spin"
            />
            Getting your location...
          </>
        ) : (
          <>
            <MapPin size={18} />
            Use my current location
          </>
        )}
      </button>

      {errors.location && (
        <ErrorText message={errors.location} />
      )}

      {formData.latitude && formData.longitude && (
        <p className="mt-2 text-xs text-emerald-600">
          Current location detected successfully.
        </p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Input
          label="City"
          value={formData.city}
          onChange={(value) => updateField("city", value)}
          placeholder="e.g. Jaunpur"
          error={errors.city}
        />

        <Input
          label="Area"
          value={formData.area}
          onChange={(value) => updateField("area", value)}
          placeholder="e.g. Civil Lines"
          error={errors.area}
        />

        <Input
          label="Pincode"
          value={formData.pincode}
          onChange={(value) => {
            if (/^\d*$/.test(value) && value.length <= 6) {
              updateField("pincode", value);
            }
          }}
          placeholder="e.g. 222001"
          inputMode="numeric"
          maxLength={6}
          error={errors.pincode}
        />

        <Input
          label="Hourly fee"
          type="number"
          value={formData.hourlyFee}
          onChange={(value) =>
            updateField("hourlyFee", value)
          }
          placeholder="e.g. 500"
          error={errors.hourlyFee}
        />
      </div>
    </div>
  );
}

/* ================= STEP 5 ================= */

function ReviewStep({ formData }) {
  const domain =
    formData.domain === "other"
      ? formData.customDomain
      : formData.domain;

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-950">
        Review your profile
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Check your information before submitting.
      </p>

      <div className="mt-6 space-y-3">
        <ReviewRow
          label="Name"
          value={formData.name}
        />

        <ReviewRow
          label="Email"
          value={formData.email}
        />

        <ReviewRow
          label="Phone"
          value={formData.phone}
        />

        <ReviewRow
          label="Qualification"
          value={formData.qualification}
        />

        <ReviewRow
          label="Experience"
          value={
            formData.experience
              ? `${formData.experience} years`
              : ""
          }
        />

        <ReviewRow
          label="Teaching domain"
          value={domain}
        />

        <ReviewRow
          label="Subjects"
          value={formData.subjects.join(", ")}
        />

        <ReviewRow
          label="Classes"
          value={formData.classes.join(", ")}
        />

        <ReviewRow
          label="Teaching mode"
          value={formatMode(formData.teachingMode)}
        />

        <ReviewRow
          label="Location"
          value={`${formData.area}, ${formData.city}`}
        />

        <ReviewRow
          label="Pincode"
          value={formData.pincode}
        />

        <ReviewRow
          label="Hourly fee"
          value={
            formData.hourlyFee
              ? `₹${formData.hourlyFee}/hour`
              : ""
          }
        />
      </div>

      <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        Your tutor profile will be reviewed before you can
        receive tutoring requests.
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  maxLength,
  inputMode,
}) {
  return (
    <div>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
          error
            ? "border-red-400 focus:ring-4 focus:ring-red-500/10"
            : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        }`}
      />

      {error && <ErrorText message={error} />}
    </div>
  );
}

function ErrorText({ message }) {
  return (
    <p className="mt-1 text-xs font-medium text-red-500">
      {message}
    </p>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-950">
        {value || "Not provided"}
      </span>
    </div>
  );
}

function formatMode(mode) {
  if (mode === "online") return "Online";
  if (mode === "home") return "Home Tuition";
  if (mode === "both") return "Online + Home";
  return "";
}

export default TutorRegister;