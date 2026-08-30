import { ArrowRight, Search, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";

import Container from "./Container";
import Button from "./Button";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-50">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />

      <Container className="relative">
        <div className="grid min-h-[calc(100vh-72px)] items-center gap-14 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">

          {/* Left */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
              <ShieldCheck size={16} />
              Verified tutors you can trust
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Find the right
              <span className="text-indigo-600"> tutor </span>
              for every learning goal.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Discover trusted tutors in your local area, connect with
              professionals, manage classes, track attendance, and follow
              student progress — all in one place.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button className="w-full gap-2 sm:w-auto">
                  Find a Tutor
                  <ArrowRight size={18} />
                </Button>
              </Link>

              <Link to="/register">
                <Button
                  variant="secondary"
                  className="w-full gap-2 sm:w-auto"
                >
                  Become a Tutor
                  <Users size={18} />
                </Button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-indigo-600" />
                Verified professionals
              </div>

              <div className="flex items-center gap-2">
                <Search size={17} className="text-indigo-600" />
                Local tutor discovery
              </div>

              <div className="flex items-center gap-2">
                <Users size={17} className="text-indigo-600" />
                Student progress tracking
              </div>
            </div>
          </div>

          {/* Right — visual dashboard preview */}
          <div className="relative mx-auto w-full max-w-lg">

            <div className="absolute -inset-5 rounded-[2rem] bg-indigo-100/50 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70">

              {/* Fake search */}
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Find a tutor near you
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <Search size={18} className="text-slate-400" />

                  <div className="text-sm text-slate-500">
                    Mathematics · Class 10 · Nearby
                  </div>
                </div>
              </div>

              {/* Tutor card */}
              <div className="mt-5 rounded-2xl border border-slate-200 p-5">

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                      AS
                    </div>

                    <div>
                      <div className="font-semibold text-slate-900">
                        Ananya Sharma
                      </div>

                      <div className="text-sm text-slate-500">
                        Mathematics · Physics
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Verified
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">
                      Experience
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      5 yrs
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">
                      Rating
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      ★ 4.9
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">
                      Distance
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      2.4 km
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">
                      Starting from
                    </div>
                    <div className="font-bold text-slate-900">
                      ₹500/hour
                    </div>
                  </div>

                  <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
                    View Profile
                  </button>
                </div>

              </div>

              {/* Small stats */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-indigo-50 p-4">
                  <div className="text-2xl font-bold text-indigo-700">
                    4.8+
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Average tutor rating
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-2xl font-bold text-slate-900">
                    100%
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Profile transparency
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}

export default Hero;