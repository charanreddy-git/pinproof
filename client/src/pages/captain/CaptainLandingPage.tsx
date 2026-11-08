import { Link } from "react-router-dom";
import {
  MarketingHeader,
  MarketingFooter,
  Button,
  FaqAccordion,
  SectionHeading,
  EarningsCard,
  Reveal,
  CheckIcon,
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  WalletIcon,
  ShieldCheckIcon,
} from "../../components";

const NAV_ITEMS = [
  { label: "How it works", to: "#how-it-works", isAnchor: true },
  { label: "Pay", to: "#pay", isAnchor: true },
  { label: "FAQ", to: "#faq", isAnchor: true },
];

const TRUST_POINTS = [
  { icon: WalletIcon, label: "₹120–500", detail: "illustrative visit fees" },
  { icon: ClockIcon, label: "Direct", detail: "payment arranged separately" },
  { icon: MapPinIcon, label: "Nearby", detail: "work around your area" },
  { icon: ShieldCheckIcon, label: "No fee", detail: "free to join" },
];

const VISIT_TYPES = [
  {
    name: "Quick check",
    payout: "120",
    note: "Example fee",
    desc: "Exterior photo, vacant plots, shop fronts.",
    popular: false,
  },
  {
    name: "Detailed visit",
    payout: "250",
    note: "Example fee",
    desc: "Rental, construction, or a custom checklist.",
    popular: false,
  },
  {
    name: "Priority inspection",
    payout: "500",
    note: "Example fee",
    desc: "Time-sensitive visits with a longer checklist.",
    popular: false,
  },
];

const STEPS = [
  ["Find a visit", "See requests near you."],
  ["Go to the pin", "Travel to the exact location."],
  ["Take the photo", "Capture it inside PinProof."],
  ["Get paid", "Payments are arranged outside this website."],
];

const FAQS = [
  {
    q: "How do I earn?",
    a: "Accept a nearby visit, travel to the pin, and submit a proof photo through PinProof. Agree the fee and payment arrangements with the requester before accepting.",
  },
  {
    q: "When do I get paid?",
    a: "Payouts are not processed on this website. Confirm the fee and payment arrangements before accepting a visit.",
  },
  {
    q: "What do I need?",
    a: "A smartphone with GPS and a camera, mobile data, and a bike, scooter, or car. No app download is required.",
  },
];

export function CaptainLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 pb-20 font-sans text-surface-900 sm:pb-0">
      <MarketingHeader
        variant="accent"
        navItems={NAV_ITEMS}
        ctaLabel="Join as inspector"
        ctaTo="/captain/signup"
      />

      <main id="main-content" className="flex-1">
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="border-b border-primary-800 bg-primary-950">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-8 lg:py-16">
            <Reveal>

              <h1 className="mt-4 text-[2.25rem] leading-[1.05] tracking-[-0.02em] text-white sm:text-[3rem] lg:text-[3.25rem]">
                Inspect properties. Earn per visit.
                <br />
                <span>Work your way.</span>
              </h1>

              <p className="mt-4 max-w-[27rem] text-[17px] leading-[1.65] text-primary-200 sm:text-[17px]">
                Check properties nearby. Agree payment arrangements before accepting.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button to="/captain/signup" variant="accent" size="lg" className="w-full sm:w-auto">
                  Start earning
                  <ArrowRightIcon size={17} />
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-[14.5px] font-semibold text-primary-300 sm:justify-start">
                  <CheckIcon size={13} className="text-accent-400" />
                  No joining fee · No fixed hours
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-[13px] font-semibold text-primary-300">
                <span className="inline-flex items-center gap-1.5">
                  <WalletIcon size={13} className="text-accent-400" />
                  Agree fees first
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon size={13} className="text-accent-400" />
                  Work nearby
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon size={13} className="text-accent-400" />
                  Choose your hours
                </span>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <EarningsCard />
            </Reveal>
          </div>
        </section>

        {/* ─── Trust strip ──────────────────────────────────────────────── */}
        <section className="border-b border-surface-200 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-surface-100 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {TRUST_POINTS.map(({ icon: Icon, label, detail }, index) => (
              <Reveal key={label} delay={index * 60}>
                <div className="flex items-center gap-2.5 px-3 py-4 first:pl-0 sm:px-5 sm:py-5">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <Icon size={15} />
                  </span>
                  <div>
                    <p className="text-[14px] font-extrabold leading-none text-surface-950">
                      {label}
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-surface-500">
                      {detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── Pay ──────────────────────────────────────────────────────── */}
        <section id="pay" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Reveal>
              <SectionHeading eyebrow="Pay" title="Plan your visit and fee." description="Illustrative fees for different scopes of work. Confirm the actual fee before accepting." />

              <div className="mt-5 divide-y divide-surface-200 rounded-xl border border-surface-200 bg-white">
                {VISIT_TYPES.map(({ name, payout, note, desc, popular }) => (
                  <div key={name} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="flex items-center gap-2 text-[15px] font-bold text-surface-950">
                        {name}
                        {popular && (
                          <span className="text-sm font-semibold text-accent-700">
                            Popular
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-[14px] text-surface-500">{desc}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="display-number text-[1.85rem] leading-none text-surface-950">
                        ₹{payout}
                      </p>
                      <p className="mt-1 text-[14px] font-semibold text-surface-500">{note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[14px] leading-relaxed text-surface-500">
                These are examples, not guaranteed earnings. PinProof does not collect payments or process inspector payouts.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── How it works + requirements ──────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-20 border-b border-surface-200 bg-surface-100">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <SectionHeading eyebrow="How it works" title="Four small steps." />

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STEPS.map(([title, desc], index) => (
                <div key={title} className="rounded-lg border border-surface-200 bg-white p-3.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-800 text-[14px] font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-2.5 text-[15px] font-bold leading-snug text-surface-950">{title}</p>
                  <p className="mt-0.5 text-[13.5px] leading-snug text-surface-500">{desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 border-t border-surface-300 pt-4 text-[14px] leading-relaxed text-surface-600">
              <span className="font-bold text-surface-900">You need:</span> smartphone
              with GPS, a working camera, a bike, scooter, or car, and mobile data
            </p>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Reveal>
              <SectionHeading eyebrow="Questions" title="Inspector questions." />
              <div className="mt-5">
                <FaqAccordion items={FAQS} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────────────────── */}
        <section className="bg-accent-400">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <h2 className="mt-2 text-[1.85rem] leading-[1.12] text-primary-950 sm:text-[2rem]">
                Start earning nearby.
              </h2>
            </div>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <Button to="/captain/signup" variant="dark" className="w-full flex-shrink-0 sm:w-auto">
                Join as inspector
                <ArrowRightIcon size={15} />
              </Button>
              <Link
                to="/verify"
                className="text-[14px] font-semibold text-primary-900 underline underline-offset-4 hover:text-primary-950"
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

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-200 bg-white/95 px-3 pt-3 bottom-safe backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-surface-900">Example fees: ₹120 to ₹500</p>
            <p className="mt-0.5 text-[13px] font-medium text-surface-500">
              Work nearby. Agree fees first. No joining fee.
            </p>
          </div>
          <Button to="/captain/signup" variant="accent" size="sm" className="min-h-11 flex-shrink-0">
            Start earning
            <ArrowRightIcon size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
