import {
  Briefcase,
  ShieldCheck,
  Users,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import Container from "./Container";

const benefits = [
  {
    icon: Briefcase,
    title: "Find teaching opportunities",
    description:
      "Build a professional presence and connect with students, parents, and institutions.",
  },
  {
    icon: ShieldCheck,
    title: "Build trusted credibility",
    description:
      "Complete verification and showcase your qualifications, experience, and expertise.",
  },
  {
    icon: Users,
    title: "Manage your students",
    description:
      "Organize students, classes, assignments, tests, and academic records.",
  },
  {
    icon: CalendarDays,
    title: "Manage your schedule",
    description:
      "Keep track of classes, availability, and attendance without relying on scattered tools.",
  },
];

function ForTutors() {
  return (
    <section
      id="for-tutors"
      className="bg-slate-950 py-24 text-white sm:py-28"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">

          {/* Content */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
              For tutors & teachers
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Turn your teaching skills into opportunities.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Create a professional teaching profile, get verified,
              connect with learners, and manage your teaching
              activities from one platform.
            </p>

            <div className="mt-9 grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-indigo-300">
                      <Icon size={19} />
                    </div>

                    <h3 className="mt-4 font-bold">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <a
              href="/register"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Become a Tutor
              <ArrowRight size={17} />
            </a>
          </div>

          {/* Verification visual */}
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur">

              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs text-slate-400">
                    Professional profile
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Tutor Verification
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <ShieldCheck size={22} />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/20 text-lg font-bold text-indigo-200">
                  RS
                </div>

                <div>
                  <p className="font-semibold">
                    Rahul Sharma
                  </p>

                  <p className="text-sm text-slate-400">
                    Mathematics · Physics
                  </p>
                </div>

                <span className="ml-auto rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Verified
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Qualification verified",
                  "Domain assessment completed",
                  "Identity documents reviewed",
                  "Professional profile approved",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.05] p-3"
                  >
                    <ShieldCheck
                      size={17}
                      className="text-emerald-300"
                    />

                    <span className="text-sm text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}

export default ForTutors;