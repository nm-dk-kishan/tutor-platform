import {
  ShieldCheck,
  FileCheck2,
  BadgeCheck,
  LockKeyhole,
} from "lucide-react";

import Container from "./Container";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Verified tutor profiles",
    description:
      "Tutor profiles can be reviewed before they become visible to students and parents.",
  },
  {
    icon: FileCheck2,
    title: "Qualification & documents",
    description:
      "Tutors can submit qualifications and supporting documents during the verification process.",
  },
  {
    icon: BadgeCheck,
    title: "Domain assessment",
    description:
      "Tutors can complete a subject-focused assessment before receiving verification.",
  },
  {
    icon: LockKeyhole,
    title: "Secure platform",
    description:
      "Authentication and role-based access help keep accounts and educational records protected.",
  },
];

function TrustSection() {
  return (
    <section className="bg-slate-50 py-24 sm:py-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Trust & verification
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Built around trust.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Education starts with the right people. Tutor is designed
            to make educator profiles more transparent and trustworthy.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon size={22} />
                </div>

                <h3 className="mt-6 font-bold text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default TrustSection;