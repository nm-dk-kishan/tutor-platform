import {
  Search,
  MessageCircle,
  BookOpen,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import Container from "./Container";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover",
    description:
      "Find tutors based on subject, class, location, experience, budget, and availability.",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Connect",
    description:
      "Explore professional profiles, check verification, and connect with the right tutor.",
  },
  {
    number: "03",
    icon: BookOpen,
    title: "Learn",
    description:
      "Schedule classes, communicate with your tutor, complete assignments, and take tests.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Track",
    description:
      "Monitor attendance, results, assignments, and learning progress in one place.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-white py-24 sm:py-28"
    >
      <Container>

        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            How Tutor works
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            From finding a tutor to tracking progress.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Tutor brings the entire learning journey together,
            making it easier for students, parents, and educators
            to connect and work together.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative rounded-3xl border border-slate-200 bg-slate-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
              >
                {/* Number */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <span className="text-sm font-bold text-slate-300">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-bold text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <ArrowRight
                    size={18}
                    className="absolute -right-7 top-12 z-10 hidden text-slate-300 lg:block"
                  />
                )}
              </div>
            );
          })}
        </div>

      </Container>
    </section>
  );
}

export default HowItWorks;