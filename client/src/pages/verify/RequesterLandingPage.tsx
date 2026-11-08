import { Link } from "react-router-dom";
import {
  MarketingHeader,
  MarketingFooter,
  Button,
  FaqAccordion,
  ProofPreview,
  SectionHeading,
  RequesterServices,
  Reveal,
  CheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "../../components";

const NAV_ITEMS = [
  { label: "How it works", to: "#how-it-works", isAnchor: true },
  { label: "Visits", to: "#visits", isAnchor: true },
  { label: "For inspectors", to: "/captain" },
];

const STEPS = [
  ["Pin the property", "Paste a Maps link or drop a pin."],
  ["A local inspector goes", "They visit the exact spot."],
  ["Get the proof", "A GPS-checked photo in your dashboard."],
];

const TRUST_POINTS = [
  { icon: MapPinIcon, label: "100 m", detail: "GPS proof radius" },
  { icon: ClockIcon, label: "Updates", detail: "Follow visit progress" },
  { icon: CheckCircleIcon, label: "Flat fee", detail: "Pay per visit" },
  { icon: ShieldCheckIcon, label: "Private", detail: "Proof stays yours" },
];

const FAQS = [
  {
    q: "What does the inspector do?",
    a: "They visit your pin, follow your notes, and submit a photo through PinProof. Arrange permission and access for any interior checks before the visit.",
  },
  {
    q: "How do I know the photo is from my property?",
    a: "The inspector’s device must report a location within 100 m of your pin to submit. Review the photo and capture method too: an uploaded photo’s original location and time are not verified.",
  },
  {
    q: "How quickly can someone visit?",
    a: "Timing depends on inspector availability, travel, and property access. Your dashboard shows when someone accepts and starts the visit.",
  },
];

export function RequesterLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50 pb-20 font-sans text-surface-900 sm:pb-0">
      <MarketingHeader
        navItems={NAV_ITEMS}
        ctaLabel="Book a visit"
        ctaTo="/verify/signup"
      />

      <main id="main-content" className="flex-1">
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-surface-200 bg-surface-50">
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 lg:px-8 lg:py-16">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/85 py-1 pl-1 pr-3 text-[13px] font-bold text-primary-800 shadow-sm backdrop-blur">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-700 text-white">
                  <ShieldCheckIcon size={12} />
                </span>
                For property owners and buyers
              </span>

              <h1 className="mt-5 text-[2.25rem] leading-[1.02] tracking-[-0.025em] text-surface-950 sm:text-[3rem] lg:text-[3.25rem]">
                See your property.
                <br />
                <span className="relative inline-block text-primary-700">
                  Without the trip.
                </span>
              </h1>

              <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.65] text-surface-600">
                For plots, flats, shops, and sites you cannot get to. A local
                inspector visits and sends a GPS-checked photo.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button to="/verify/signup" variant="accent" size="lg" className="w-full sm:w-auto">
                  Book a visit
                  <ArrowRightIcon size={17} />
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-[14.5px] font-semibold text-surface-600 sm:justify-start">
                  <CheckIcon size={14} className="text-primary-600" />
                  From ₹999 · no app needed
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {[
                  { icon: ShieldCheckIcon, label: "GPS-verified proof" },
                  { icon: ClockIcon, label: "Live visit tracking" },
                  { icon: CheckCircleIcon, label: "Pay per visit" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-white/70 px-2.5 py-1.5 text-[13px] font-semibold text-surface-600 backdrop-blur"
                  >
                    <Icon size={12} className="text-primary-600" />
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <ProofPreview />
            </Reveal>
          </div>
        </section>

        {/* ─── Trust strip ──────────────────────────────────────────────── */}
        <section className="border-b border-surface-200 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2.5 px-4 py-5 sm:px-6 lg:grid-cols-4 lg:gap-3 lg:px-8">
            {TRUST_POINTS.map(({ icon: Icon, label, detail }, index) => {
              const tones = [
                "bg-primary-50 text-primary-700",
                "bg-accent-100 text-accent-800",
                "bg-info-50 text-info-700",
                "bg-success-50 text-success-700",
              ];
              return (
                <Reveal key={label} delay={index * 60}>
                  <div className="flex h-full items-center gap-3 border-l-2 border-surface-200 p-3 sm:p-4">
                    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${tones[index]}`}>
                      <Icon size={17} />
                    </span>
                    <div>
                      <p className="display-number text-[1.25rem] leading-none text-surface-950">
                        {label}
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-surface-500">
                        {detail}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ─── Visits + how it works ────────────────────────────────────── */}
        <section id="visits" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Reveal>
              <SectionHeading
                eyebrow="What we check"
                title="Pick what you need."
                description="Every visit includes a photo, submission GPS, and a private visit record."
              />

              <div className="mt-6">
                <RequesterServices />
              </div>

              <div
                id="how-it-works"
                className="mt-10 scroll-mt-20 border-t border-surface-200 pt-8"
              >
                <h3 className="mt-2 text-[1.6rem] leading-tight text-surface-950 sm:text-[1.9rem]">
                  How it works in three steps.
                </h3>
                <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
                  <div
                    aria-hidden="true"
                    className="absolute left-[17%] right-[17%] top-7 hidden border-t-2 border-dashed border-primary-200 sm:block"
                  />
                  {STEPS.map(([title, desc], index) => (
                    <div
                      key={title}
                      className="relative rounded-xl border border-surface-200 bg-white p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-800 text-[14px] font-extrabold text-white ring-4 ring-white">
                          {index + 1}
                        </span>
                        <p className="text-[15.5px] font-extrabold text-surface-950">{title}</p>
                      </div>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-surface-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-5 border-t border-surface-200 pt-4 text-[14px] text-surface-500">
                Standard ₹999. Detailed ₹2,499.{" "}
                <Link to="/#pricing" className="font-bold text-primary-700 underline underline-offset-4">
                  Compare visits
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section className="border-b border-surface-200 bg-surface-50">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Reveal>
              <SectionHeading eyebrow="Questions" title="Before you book." />
              <div className="mt-5">
                <FaqAccordion items={FAQS} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Inspector strip ──────────────────────────────────────────── */}
        <section className="border-b border-primary-800 bg-primary-950">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div>
              <p className="text-[15px] font-bold text-white">Want to earn instead?</p>
              <p className="mt-0.5 text-[14px] text-primary-300">
                Check properties nearby. Agree payment arrangements before accepting.
              </p>
            </div>
            <Button to="/captain/signup" variant="accent" size="sm" className="min-h-11 w-full flex-shrink-0 sm:w-auto">
              Start earning
              <ArrowRightIcon size={14} />
            </Button>
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────────────────── */}
        <section className="bg-accent-400">
          <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-9 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <h2 className="mt-2 text-[1.9rem] leading-[1.1] text-primary-950 sm:text-[2.25rem]">
                Get a closer look at your property.
              </h2>
              <p className="mt-1.5 max-w-md text-[13.5px] font-semibold text-primary-900/75">
                A local inspector. A GPS-checked photo. One flat fee.
              </p>
            </div>
            <Button to="/verify/signup" variant="dark" className="w-full flex-shrink-0 sm:w-auto">
              Book a visit
              <ArrowRightIcon size={15} />
            </Button>
          </div>
        </section>
      </main>

      <MarketingFooter />

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-200 bg-white/95 px-3 pt-3 bottom-safe backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-surface-900">Visits from ₹999</p>
            <p className="mt-0.5 text-[13px] font-medium text-surface-500">
              Photo and submission GPS.
            </p>
          </div>
          <Button to="/verify/signup" variant="accent" size="sm" className="min-h-11 flex-shrink-0">
            Book a visit
            <ArrowRightIcon size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
