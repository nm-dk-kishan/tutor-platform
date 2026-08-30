import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import Container from "../common/Container";
import Button from "../common/Button";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
      <Container>
        <nav className="flex h-18 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              T
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Tutor
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              Find a Tutor
            </Link>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              How It Works
            </a>

            <a
              href="#for-tutors"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              Become a Tutor
            </a>

            <a
              href="#for-schools"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              For Schools
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login">
              <Button variant="ghost">
                Log in
              </Button>
            </Link>

            <Link to="/register">
              <Button>
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t border-slate-200 py-5 md:hidden">
            <div className="flex flex-col gap-4">

              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                Find a Tutor
              </Link>

              <a
                href="#how-it-works"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                How It Works
              </a>

              <a
                href="#for-tutors"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                Become a Tutor
              </a>

              <a
                href="#for-schools"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                For Schools
              </a>

              <div className="flex gap-3 border-t border-slate-200 pt-4">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  <Button variant="secondary" className="w-full">
                    Log in
                  </Button>
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  <Button className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

export default Navbar;