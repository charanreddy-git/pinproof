import { Link } from "react-router-dom";
import { Button } from "./ui";
import { SectionHeading } from "./SectionHeading";
import { ArrowRightIcon, ClockIcon } from "./Icons";

/**
 * Dark cross-sell band for the inspector side. Shared by the home page and
 * the requester landing page so both audiences can switch paths in one click.
 */
export function InspectorEarnBand() {
  return (
    <section className="survey-grid-dark bg-primary-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16 lg:px-8">
        <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
          <p className="eyebrow text-accent-300">Per-visit pay</p>
          <div className="mt-4 divide-y divide-white/10">
            {[
              ["Quick check", "₹120"],
              ["Detailed visit", "₹250"],
              ["Priority inspection", "₹500"],
            ].map(([label, pay]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <span className="text-[12.5px] font-medium text-primary-100">{label}</span>
                <span className="display-number text-[1.25rem] leading-none text-white">{pay}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 border-t border-white/10 pt-3.5 text-[11.5px] leading-relaxed text-primary-200">
            <ClockIcon size={14} className="mt-0.5 flex-shrink-0 text-accent-400" />
            Weekly settlement to bank or UPI. No joining fee.
          </p>
        </div>

        <div>
          <SectionHeading
            tone="dark"
            eyebrow="Earn with PinProof"
            title="Get paid to check properties nearby."
            description="Turn your local knowledge into per-visit income. Accept nearby checks when they suit your day, and get paid after the requester reviews the proof."
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button to="/captain/signup" variant="accent">
              Start earning
              <ArrowRightIcon size={15} />
            </Button>
            <Link
              to="/captain"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              How inspecting works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
