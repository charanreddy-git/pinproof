import {
  MarketingHeader,
  MarketingFooter,
  Button,
  ProofStandardCard,
  SectionHeading,
  RequesterServices,
  InspectorEarnBand,
  CheckIcon,
  ArrowRightIcon,
} from "../components";

const NAV_ITEMS = [
  { label: "How it works", to: "#how-it-works", isAnchor: true },
  { label: "Visits", to: "#visits", isAnchor: true },
  { label: "Pricing", to: "#pricing", isAnchor: true },
  { label: "For inspectors", to: "/captain" },
];

const STEPS = [
  ["Pin the property", "Paste a Maps link or drop a pin."],
  ["A local inspector goes", "They visit the exact spot."],
  ["Get the proof", "A GPS-checked photo in your dashboard."],
];

const PLANS = [
  {
    name: "Standard visit",
    price: "999",
    note: "Exterior photo · 24–48 hours",
    popular: false,
  },
  {
    name: "Detailed visit",
    price: "2,499",
    note: "Custom checklist · priority match",
    popular: true,
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 font-sans text-surface-900">
      <MarketingHeader
        navItems={NAV_ITEMS}
        ctaLabel="Book a visit"
        ctaTo="/verify/signup"
      />

      <main className="flex-1">
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="border-b border-surface-200 bg-surface-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-9 sm:px-6 sm:pb-14 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-8 lg:py-16">
            <div>
              <p className="eyebrow text-primary-800">Property visits across India</p>

              <h1 className="mt-4 text-[2.55rem] leading-[1.05] tracking-[-0.02em] text-surface-950 sm:text-[3.5rem] lg:text-[4rem]">
                See your property.
                <br />
                <span className="text-primary-700">From anywhere.</span>
              </h1>

              <p className="mt-4 max-w-[29rem] text-[17px] leading-[1.65] text-surface-600 sm:text-[17px]">
                A local inspector visits, photographs, and sends you a GPS-checked
                proof.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button to="/verify/signup" variant="accent" size="lg" className="w-full sm:w-auto">
                  Book a visit
                  <ArrowRightIcon size={17} />
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-[14.5px] font-semibold text-surface-500 sm:justify-start">
                  <CheckIcon size={13} className="text-primary-600" />
                  From ₹999 · No app needed
                </p>
              </div>
            </div>

            <ProofStandardCard />
          </div>
        </section>

        {/* ─── Visits + how it works ────────────────────────────────────── */}
        <section id="visits" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <SectionHeading
              eyebrow="What we check"
              title="Pick what you need."
            />

            <div className="mt-5">
              <RequesterServices />
            </div>

            <p className="mt-4 text-[14px] font-medium text-surface-500">
              Every visit includes a GPS-checked photo and a private report.
            </p>

            <div
              id="how-it-works"
              className="mt-8 scroll-mt-20 border-t border-surface-200 pt-6"
            >
              <p className="eyebrow text-primary-700">How it works</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {STEPS.map(([title, desc], index) => (
                  <div key={title} className="flex gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary-800 text-[12px] font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-[15px] font-bold text-surface-950">{title}</p>
                      <p className="mt-0.5 text-[14px] leading-snug text-surface-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Pricing ──────────────────────────────────────────────────── */}
        <section id="pricing" className="scroll-mt-20 border-b border-surface-200 bg-accent-50/70">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <SectionHeading
              eyebrow="Pricing"
              title="One flat fee per visit."
            />

            <div className="mt-5 divide-y divide-surface-200 rounded-xl border border-surface-200 bg-white">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <p className="flex items-center gap-2 text-[15px] font-bold text-surface-950">
                      {plan.name}
                      {plan.popular && (
                        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-700">
                          Popular
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-[14px] text-surface-500">{plan.note}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <p className="display-number text-[1.85rem] leading-none text-surface-950">
                      ₹{plan.price}
                    </p>
                    <Button
                      to="/verify/signup"
                      variant={plan.popular ? "accent" : "secondary"}
                      size="sm"
                      className="min-h-11"
                    >
                      Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[14px] leading-relaxed text-surface-500">
              Pay per visit. UPI, cards, and international transfer options available.
            </p>
          </div>
        </section>

        {/* ─── Inspector path ───────────────────────────────────────────── */}
        <InspectorEarnBand />

        {/* ─── Final CTA ────────────────────────────────────────────────── */}
        <section className="bg-accent-400">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <p className="eyebrow text-primary-800">Ready when you are</p>
              <h2 className="mt-2 text-[1.85rem] leading-[1.12] text-primary-950 sm:text-[2rem]">
                See your property this week.
              </h2>
            </div>
            <Button to="/verify/signup" variant="primary" className="w-full flex-shrink-0 sm:w-auto">
              Book a visit
              <ArrowRightIcon size={15} />
            </Button>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
