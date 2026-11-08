import { Link } from "react-router-dom";
import { Logo, Button } from "../components";
import { CompassIcon, MapPinIcon, ShieldCheckIcon } from "../components/Icons";

const HELPFUL_LINKS = [
  { label: "How PinProof works", to: "/#how-it-works" },
  { label: "Pricing", to: "/#pricing" },
  { label: "For inspectors", to: "/captain" },
  { label: "Sign in", to: "/login" },
];

export function NotFoundPage() {
  return (
    <div className="bg-surface-100 flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <Link
          to="/"
          className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-surface-600 transition-colors hover:text-surface-950"
        >
          Back to home
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-6 sm:px-6">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-surface-300 bg-white">
            <MapPinIcon size={36} className="text-primary-700" />
          </div>

          <h1 className="mt-7 text-[2.1rem] leading-[1.12] text-surface-950 sm:text-[2.6rem]">
            Page not found.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-[1.7] text-surface-600">
            The address may be mistyped or the link may have changed. Return home or use one of the links below.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button to="/" size="lg">
              Go to home
            </Button>
            <Button to="/verify" variant="secondary" size="lg">
              Book a visit
            </Button>
          </div>

          <div className="mt-11 border-l-2 border-primary-700 bg-white px-4 py-4 text-left">
            <p className="flex items-center gap-1.5 text-[14px] font-bold text-surface-700">
              <CompassIcon size={14} className="text-primary-600" />
              Looking for something?
            </p>
            <nav aria-label="Helpful links" className="mt-2 divide-y divide-surface-100">
              {HELPFUL_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex min-h-11 items-center justify-between gap-2 py-2 text-[13px] font-semibold text-surface-700 transition-colors hover:text-primary-800"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-[13px] font-medium text-surface-500">
            <ShieldCheckIcon size={12} className="text-primary-600" />
            GPS-verified proof · private by default
          </p>
        </div>
      </main>
    </div>
  );
}
