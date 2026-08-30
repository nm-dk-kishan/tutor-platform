import {
  Search,
  CalendarCheck,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

import Container from "./Container";

const benefits = [
  {
    icon: Search,
    title: "Find the right tutor",
    description:
      "Search by subject, class, location, experience, fees, availability, and more.",
  },
  {
    icon: CalendarCheck,
    title: "Stay organized",
    description:
      "Keep tutoring schedules and class attendance organized in one place.",
  },
  {
    icon: ClipboardCheck,
    title: "Manage assessments",
    description:
      "Take tests, submit assignments, and keep your academic records accessible.",
  },
  {
    icon: TrendingUp,
    title: "Understand progress",
    description:
      "Track marks and performance over time so students and parents know where to improve.",
  },
];

function ForStudents() {
  return (
    <section id="for-students" className="bg-white py-24 sm:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">

          {/* Visual */}
          <div className="order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-xl shadow-slate-200/50">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Learning overview
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-950">
                    Student Progress
                  </h3>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  On track
                </span>
              </div>

              {/* Progress */}
              <div className="mt-7 rounded-2xl bg-white p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Overall performance
                    </p>

                    <p className="mt-1 text-4xl font-bold text-slate-950">
                      82%
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-emerald-600">
                    +12%
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[82%] rounded-full bg-indigo-600" />
                </div>
              </div>

              {/* Subjects */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Mathematics", "88%"],
                  ["Physics", "81%"],
                  ["English", "76%"],
                ].map(([subject, score]) => (
                  <div
                    key={subject}
                    className="rounded-2xl bg-white p-4"
                  >
                    <p className="text-xs text-slate-500">
                      {subject}
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-950">
                      {score}
                    </p>
                  </div>
                ))}
              </div>

              {/* Attendance */}
              <div className="mt-4 rounded-2xl bg-indigo-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Tutor attendance
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      This month's classes
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-indigo-700">
                    96%
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
              For students & parents
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Everything you need to make learning easier.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Find trusted educators and keep the entire tutoring
              journey organized — from the first connection to
              long-term progress.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon size={19} />
                    </div>

                    <h3 className="mt-4 font-bold text-slate-950">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <Link
                to="/register"
                className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Start finding a tutor
                <ArrowRight size={17} />
              </Link>
          </div>

        </div>
      </Container>
    </section>
  );
}

export default ForStudents;