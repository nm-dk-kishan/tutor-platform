import {
  ShieldCheck,
  MapPin,
  ClipboardCheck,
  Users,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

import Container from "./Container";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified educators",
    description:
      "Tutor profiles can go through qualification, domain assessment, document review, and admin verification.",
  },
  {
    icon: MapPin,
    title: "Find tutors locally",
    description:
      "Discover educators based on your area, teaching preferences, subjects, and availability.",
  },
  {
    icon: ClipboardCheck,
    title: "Manage learning",
    description:
      "Keep tests, assignments, marks, and academic records organized in one platform.",
  },
  {
    icon: CalendarCheck,
    title: "Transparent attendance",
    description:
      "Students and tutors can record attendance, helping parents maintain a clear class history.",
  },
  {
    icon: Users,
    title: "Built for every role",
    description:
      "Students, parents, tutors, and institutions each get tools designed around their needs.",
  },
  {
    icon: TrendingUp,
    title: "Track progress",
    description:
      "Understand performance over time and identify areas where students need more support.",
  },
];

function WhyTutor() {
  return (
    <section className="bg-slate-50 py-24 sm:py-28">
      <Container>

        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

          {/* Left */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Why Tutor
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              More than finding a teacher.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Tutor connects people who need education with
              professionals who provide it — then helps them
              manage the learning relationship from start to finish.
            </p>

            <div className="mt-8 rounded-2xl border border-indigo-100 bg-white p-5">
              <div className="text-sm font-semibold text-slate-950">
                One connected learning journey
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>Find</span>
                <span>→</span>
                <span>Connect</span>
                <span>→</span>
                <span>Learn</span>
                <span>→</span>
                <span>Track</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 font-bold text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </Container>
    </section>
  );
}

export default WhyTutor;