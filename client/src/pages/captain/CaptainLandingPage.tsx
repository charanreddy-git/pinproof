import { Link } from "react-router-dom";
import {
  MarketingHeader,
  MarketingFooter,
  Button,
  FaqAccordion,
  SectionHeading,
  EarningsCard,
  CheckIcon,
  ArrowRightIcon,
} from "../../components";

const NAV_ITEMS = [
  { label: "How it works", to: "#how-it-works", isAnchor: true },
  { label: "Pay", to: "#pay", isAnchor: true },
  { label: "FAQ", to: "#faq", isAnchor: true },
];

const VISIT_TYPES = [
  {
    name: "Quick check",
    payout: "120",
    note: "Same day",
    desc: "Exterior photo, vacant plots, shop fronts.",
    popular: false,
  },
  {
    name: "Detailed visit",
    payout: "250",
    note: "Within 24 hours",
    desc: "Rental, construction, or a custom checklist.",
    popular: true,
  },
  {
    name: "Priority inspection",
    payout: "500",
    note: "Priority",
    desc: "Time-sensitive visits with a longer checklist.",
    popular: false,
  },
];

const STEPS = [
  ["Find a visit", "See requests near you."],
  ["Go to the pin", "Travel to the exact location."],
  ["Take the photo", "Capture it inside PinProof."],
  ["Get paid", "Settled weekly to bank or UPI."],
];

const FAQS = [
  {
    q: "How do I earn?",
    a: "Accept a nearby visit, travel to the pin, and submit a proof photo through PinProof. You are paid after the requester reviews it.",
  },
  {
    q: "When do I get paid?",
    a: "Completed visits are settled weekly to your bank account or UPI. There is no minimum payout.",
  },
  {
    q: "What do I need?",
    a: "A smartphone with GPS and a camera, mobile data, and a bike, scooter, or car. No app download is required.",
  },
];

export function CaptainLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 font-sans text-surface-900">
      <MarketingHeader
        variant="accent"
        navItems={NAV_ITEMS}
        ctaLabel="Join as inspector"
        ctaTo="/captain/signup"
      />

      <main className="flex-1">
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="survey-grid-dark border-b border-primary-800 bg-primary-950">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-8 lg:py-16">
            <div>
              <p className="eyebrow text-accent-300">For inspectors</p>

              <h1 className="mt-4 text-[2.55rem] leading-[1.05] tracking-[-0.02em] text-white sm:text-[3.5rem] lg:text-[4rem]">
                Earn per visit.
                <br />
                <span className="text-accent-400">Work your way.</span>
              </h1>

              <p className="mt-4 max-w-[27rem] text-[15.5px] leading-[1.65] text-primary-200 sm:text-[16.5px]">
                Check properties nearby. Get paid weekly.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button to="/captain/signup" variant="accent" size="lg" className="w-full sm:w-auto">
                  Start earning
                  <ArrowRightIcon size={17} />
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary-300 sm:justify-start">
                  <CheckIcon size={13} className="text-accent-400" />
                  No joining fee · No fixed hours
                </p>
              </div>
            </div>

            <EarningsCard />
          </div>
        </section>

        {/* ─── Pay ──────────────────────────────────────────────────────── */}
        <section id="pay" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <SectionHeading eyebrow="Pay" title="What a visit pays." />

            <div className="mt-5 divide-y divide-surface-200 rounded-xl border border-surface-200 bg-white">
              {VISIT_TYPES.map(({ name, payout, note, desc, popular }) => (
                <div key={name} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="flex items-center gap-2 text-[13.5px] font-bold text-surface-950">
                      {name}
                      {popular && (
                        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-accent-700">
                          Popular
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-[11.5px] text-surface-500">{desc}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="display-number text-[1.7rem] leading-none text-surface-950">
                      ₹{payout}
                    </p>
                    <p className="mt-1 text-[9.5px] font-semibold text-surface-500">{note}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[11.5px] leading-relaxed text-surface-500">
              Pay is listed before you accept. No deductions.
            </p>
          </div>
        </section>

        {/* ─── How it works + requirements ──────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-20 border-b border-surface-200 bg-surface-100">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <SectionHeading eyebrow="How it works" title="Four small steps." />

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STEPS.map(([title, desc], index) => (
                <div key={title} className="rounded-lg border border-surface-200 bg-white p-3.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-800 text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-2.5 text-[12.5px] font-bold leading-snug text-surface-950">{title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-surface-500">{desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 border-t border-surface-300 pt-4 text-[11.5px] leading-relaxed text-surface-600">
              <span className="font-bold text-surface-900">You need:</span> smartphone
              with GPS · working camera · bike, scooter, or car · mobile data
            </p>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <SectionHeading eyebrow="Questions" title="Inspector questions." />
            <div className="mt-5">
              <FaqAccordion items={FAQS} />
            </div>
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────────────────── */}
        <section className="bg-accent-400">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <p className="eyebrow text-primary-800">Ready when you are</p>
              <h2 className="mt-2 text-[1.7rem] leading-[1.12] text-primary-950 sm:text-[2rem]">
                Start earning nearby.
              </h2>
            </div>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <Button to="/captain/signup" variant="primary" className="w-full flex-shrink-0 sm:w-auto">
                Join as inspector
                <ArrowRightIcon size={15} />
              </Button>
              <Link
                to="/verify"
                className="text-[12px] font-semibold text-primary-900 underline underline-offset-4 hover:text-primary-950"
              >
                Need a visit instead?
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter
        variant="accent"
        tagline="Inspect properties nearby and earn per visit. Photograph, geotag, and submit proof."
      />
    </div>
  );
}
