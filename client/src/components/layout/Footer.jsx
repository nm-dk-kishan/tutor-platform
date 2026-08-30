import { Link } from "react-router-dom";
import Container from "../common/Container";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                T
              </div>

              <span className="text-lg font-bold text-slate-950">
                Tutor
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              Connecting students, parents, educators, and
              institutions through a trusted learning platform.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Platform
            </h3>

            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <a
                href="#how-it-works"
                className="block transition hover:text-indigo-600"
              >
                How It Works
              </a>

              <a
                href="#for-students"
                className="block transition hover:text-indigo-600"
              >
                For Students
              </a>

              <a
                href="#for-tutors"
                className="block transition hover:text-indigo-600"
              >
                For Tutors
              </a>

              <a
                href="#for-schools"
                className="block transition hover:text-indigo-600"
              >
                For Schools
              </a>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Account
            </h3>

            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <Link
                to="/login"
                className="block transition hover:text-indigo-600"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="block transition hover:text-indigo-600"
              >
                Create account
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              About
            </h3>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              A modern platform designed to make finding,
              teaching, and managing education simpler.
            </p>
          </div>

        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Tutor. All rights reserved.
          </p>

          <p>
            Built for better learning connections.
          </p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;