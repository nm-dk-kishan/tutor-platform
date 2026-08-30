import { ArrowRight, GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";

import Container from "./Container";

function FinalCTA() {
  return (
    <section className="bg-white py-24 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-indigo-600 px-7 py-14 text-center sm:px-12 sm:py-16">

          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-indigo-50">
              <GraduationCap size={16} />
              Start your journey with Tutor
            </span>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              The right connection can change the way you learn.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-indigo-100">
              Whether you're looking for a tutor, building your
              teaching career, or hiring educators for your institution,
              Tutor brings everything together.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                Get Started
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <Users size={17} />
                Become a Tutor
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}

export default FinalCTA;