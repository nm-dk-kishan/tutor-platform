import {
  Search,
  UserCheck,
  School,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import Container from "./Container";

const benefits = [
  {
    icon: Search,
    title: "Find qualified teachers",
    description:
      "Search professional profiles using subject, qualification, experience, and other criteria.",
  },
  {
    icon: UserCheck,
    title: "Hire with confidence",
    description:
      "Discover educators whose profiles have gone through the platform's verification process.",
  },
  {
    icon: School,
    title: "Manage teaching staff",
    description:
      "Organize teachers and assign them to classes and academic responsibilities.",
  },
  {
    icon: BarChart3,
    title: "Monitor performance",
    description:
      "Keep institutional records of attendance, assessments, and student outcomes.",
  },
];

function ForInstitutions() {
  return (
    <section
      id="for-schools"
      className="bg-white py-24 sm:py-28"
    >
      <Container>

        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            For schools & colleges
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Build stronger teaching teams.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Give institutions a professional way to discover,
            evaluate, hire, and manage educators.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <Icon size={22} />
                </div>

                <h3 className="mt-6 font-bold text-slate-950">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-3xl bg-slate-950 p-7 text-white sm:flex-row sm:p-9">
          <div>
            <h3 className="text-xl font-bold">
              Looking for your next teacher?
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Explore verified educators and build your teaching team.
            </p>
          </div>

          <a
            href="/register"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Register your institution
            <ArrowRight size={17} />
          </a>
        </div>

      </Container>
    </section>
  );
}

export default ForInstitutions;