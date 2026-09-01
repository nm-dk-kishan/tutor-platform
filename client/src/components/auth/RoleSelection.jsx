import {
  GraduationCap,
  HeartHandshake,
  BriefcaseBusiness,
  School,
  ArrowRight,
} from "lucide-react";

const roles = [
  {
    value: "student",
    title: "Student",
    description:
      "Find tutors, attend classes, take tests, and track your learning progress.",
    icon: GraduationCap,
  },
  {
    value: "parent",
    title: "Parent",
    description:
      "Find tutors for your child and keep track of attendance, tests, and progress.",
    icon: HeartHandshake,
  },
  {
    value: "tutor",
    title: "Tutor / Teacher",
    description:
      "Build your professional profile, find students, and manage your teaching.",
    icon: BriefcaseBusiness,
  },
  {
    value: "school",
    title: "School / College",
    description:
      "Discover verified educators and build your teaching team.",
    icon: School,
  },
];

function RoleSelection({ selectedRole, onSelect }) {
  return (
    <div>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Create your Tutor account
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          Choose how you want to use Tutor.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.value;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onSelect(role.value)}
              className={`group relative rounded-2xl border p-5 text-left transition-all duration-200 ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/10"
                  : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  <Icon size={21} />
                </div>

                <ArrowRight
                  size={18}
                  className={`transition ${
                    isSelected
                      ? "text-indigo-600"
                      : "text-slate-300 group-hover:text-indigo-500"
                  }`}
                />
              </div>

              <h2 className="mt-5 font-bold text-slate-950">
                {role.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {role.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RoleSelection;