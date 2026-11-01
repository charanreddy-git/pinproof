import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { ShieldCheckIcon } from "./Icons";

interface MarketingFooterProps {
  variant?: "primary" | "accent";
  logoLabel?: string;
  tagline?: string;
}

export function MarketingFooter({
  variant = "primary",
  logoLabel = "PinProof",
  tagline = "Independent inspectors visit your property and send back a dated, GPS-verified photo — so you can decide without making the trip.",
}: MarketingFooterProps) {
  const footerLinks = {
    Explore: [
      { label: "How it works", to: "/#how-it-works" },
      { label: "Pricing", to: "/#pricing" },
      { label: "For property owners", to: "/verify" },
    ],
    "Your account": [
      { label: "Sign in", to: "/login" },
      { label: "Book a property visit", to: "/verify/signup" },
      { label: "Earn as an inspector", to: "/captain/signup" },
    ],
  };

  return (
    <footer className="border-t border-surface-200 bg-surface-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-[1.4fr_0.6fr_0.6fr] lg:gap-16">
          <div className="col-span-2 lg:col-span-1">
            <Logo size="sm" variant={variant} label={logoLabel} />
            <p className="mt-6 max-w-md text-[16px] font-semibold leading-relaxed text-surface-800">
              A real person. A real visit. A proof you can keep.
            </p>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-surface-500">
              {tagline}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] font-semibold text-surface-600">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheckIcon size={13} className="text-primary-600" />
                GPS-verified
              </span>
              <span aria-hidden="true" className="text-surface-300">·</span>
              <span>Made in India</span>
              <span aria-hidden="true" className="text-surface-300">·</span>
              <span>UPI-friendly</span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-surface-500">{section}</h4>
              <ul className="mt-3 space-y-1">
                {links.map((link) => (
                  <li key={`${section}-${link.to}`}>
                    <Link
                      to={link.to}
                      className="inline-flex min-h-11 items-center text-[15.5px] font-semibold text-surface-700 transition-colors hover:text-primary-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-surface-200 pt-5 text-[13.5px] text-surface-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} PinProof. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Private photo proof</span>
            <span aria-hidden="true">·</span>
            <span>100 m GPS check</span>
            <span aria-hidden="true">·</span>
            <span>Built for India</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
