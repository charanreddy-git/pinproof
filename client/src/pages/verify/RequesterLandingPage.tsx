import {
  MarketingHeader,
  MarketingFooter,
  Button,
  FaqAccordion,
  ProofStandardCard,
  SectionHeading,
  RequesterServices,
  InspectorEarnBand,
  CheckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  MapPinIcon,
  CameraIcon,
  CompassIcon,
  IndianRupeeIcon,
} from "../../components";

const NAV_ITEMS = [
  { label: "How it works", to: "#how-it-works", isAnchor: true },
  { label: "Visits", to: "#visits", isAnchor: true },
  { label: "For inspectors", to: "/captain" },
];

const FAQS = [
  {
    q: "What does the inspector actually do?",
    a: "The inspector travels to the exact pin you share, checks the property from the outside (and inside for a Detailed visit), takes a photo through PinProof, and submits it. You can add specific instructions for them.",
  },
  {
    q: "Can I book a visit for a plot with no address?",
    a: "Yes. A Google Maps pin is the most reliable location for a plot. You can paste a Maps link or tap the exact spot on the map. That coordinate is what the inspector travels to.",
  },
  {
    q: "How will I know the photo was taken at my property?",
    a: "Proof can only be submitted from within 100 m of your pin. The location and time are stored with the visit, so you can see where and when the photo was taken.",
  },
  {
    q: "How quickly can someone visit?",
    a: "Most requests are accepted within a few hours and completed within 24–48 hours. The Detailed visit gets priority matching where an inspector is available.",
  },
];

const STEPS = [
  {
    icon: MapPinIcon,
    title: "Pin the property",
    desc: "Paste a Maps link or tap the exact spot. Add a note about what matters.",
  },
  {
    icon: CompassIcon,
    title: "A local inspector goes",
    desc: "They accept, travel to the pin, and follow your checklist on site.",
  },
  {
    icon: CameraIcon,
    title: "Get the proof",
    desc: "A dated, GPS-checked photo and a clear summary land in your dashboard.",
  },
];

const BENEFITS = [
  {
    label: "Location checked, not claimed",
    copy: "Proof is captured inside PinProof, with GPS coordinates and accuracy attached. If the photo is outside the 100 m radius, our server rejects it.",
    icon: ShieldCheckIcon,
    visual: "radius",
  },
  {
    label: "Local feet on the ground",
    copy: "An independent inspector near the property accepts the visit. You can follow the trip and see exactly when the photo was taken.",
    icon: CompassIcon,
    visual: "timeline",
  },
  {
    label: "One visit, one clear price",
    copy: "The fee is agreed before the visit. No subscription, no travel surcharge, and no charge for asking a question first.",
    icon: IndianRupeeIcon,
    visual: "price",
  },
] as const;

function BenefitVisual({ visual }: { visual: (typeof BENEFITS)[number]["visual"] }) {
  if (visual === "radius") {
    return (
      <div className="survey-grid-dark relative flex h-44 items-center justify-center overflow-hidden bg-primary-950">
        <div className="absolute h-32 w-32 rounded-full border border-accent-400/40" />
        <div className="absolute h-20 w-20 rounded-full border border-accent-400/20" />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-accent-400 text-primary-950">
          <MapPinIcon size={20} />
        </span>
        <span className="absolute bottom-3 right-4 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-300">
          100 m radius
        </span>
      </div>
    );
  }

  if (visual === "timeline") {
    return (
      <div className="flex h-44 flex-col justify-center gap-3 bg-surface-100 p-4">
        {[
          ["Requested", "2 min"],
          ["Accepted", "Same day"],
          ["Proof ready", "24–48 hrs"],
        ].map(([label, time], index) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                index === 2
                  ? "bg-accent-400 text-primary-950"
                  : "border border-surface-300 bg-white text-primary-700"
              }`}
            >
              {index + 1}
            </span>
            <p className="flex-1 text-[11.5px] font-bold text-surface-900">{label}</p>
            <span className="text-[10px] font-semibold text-surface-500">{time}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-44 flex-col justify-center bg-accent-50 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent-800">
        Standard visit
      </p>
      <p className="display-number mt-1 text-[2.8rem] leading-none text-surface-950">₹999</p>
      <div className="mt-3 flex items-center justify-between border-t border-accent-200 pt-2">
        <span className="text-[11px] font-semibold text-surface-700">Detailed visit</span>
        <span className="text-[11px] font-bold text-surface-950">₹2,499</span>
      </div>
      <p className="mt-1 text-[10.5px] text-surface-600">No subscription · No travel surcharge</p>
    </div>
  );
}

export function RequesterLandingPage() {
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
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-14 lg:px-8 lg:py-20">
            <div>
              <p className="eyebrow text-primary-800">Property visits across India</p>

              <h1 className="mt-4 text-[2.7rem] leading-[1.04] tracking-[-0.02em] text-surface-950 sm:text-[3.6rem] lg:text-[4.1rem]">
                See your property.
                <br />
                <span className="text-primary-700">Without the trip.</span>
              </h1>

              <p className="mt-5 max-w-[33rem] text-[16px] leading-[1.7] text-surface-600 sm:text-[17px]">
                A local inspector visits the exact pin, takes a GPS-checked photo, and
                sends back a clear summary. For plots, flats, shops, and sites you
                cannot get to.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button to="/verify/signup" variant="accent" size="lg" className="w-full sm:w-auto">
                  Book a property visit
                  <ArrowRightIcon size={17} />
                </Button>
                <a
                  href="#visits"
                  className="inline-flex min-h-12 items-center justify-center gap-2 px-1 text-[14px] font-semibold text-surface-700 transition-colors hover:text-surface-950 sm:justify-start"
                >
                  Choose a visit
                  <span aria-hidden="true" className="text-surface-400">↓</span>
                </a>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-3 divide-x divide-surface-200 border-y border-surface-200">
                {[
                  ["₹999", "from, per visit"],
                  ["100 m", "GPS-checked"],
                  ["24–48 hrs", "typical turnaround"],
                ].map(([value, label]) => (
                  <div key={label} className="px-3 py-3.5 first:pl-0">
                    <p className="text-[14px] font-bold leading-tight text-surface-950">{value}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-surface-500">{label}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 flex items-center gap-2 text-[12.5px] font-semibold text-surface-500">
                <CheckIcon size={14} className="text-primary-600" />
                No app download · UPI-friendly · You pay per visit
              </p>
            </div>

            <div>
              <ProofStandardCard />
              <p className="mt-3 text-center text-[10.5px] font-medium text-surface-500">
                The same standard applies to every visit.
              </p>
            </div>
          </div>
        </section>

        {/* ─── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-20 border-b border-surface-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-0 px-4 py-2 sm:px-6 sm:grid-cols-3 sm:divide-x sm:divide-surface-200 lg:px-8">
            {STEPS.map(({ icon: Icon, title, desc }, index) => (
              <div key={title} className="flex gap-3.5 border-b border-surface-200 py-4 last:border-b-0 sm:border-b-0 sm:px-5 sm:py-6 sm:first:pl-0 sm:last:pr-0">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-surface-400">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-0.5 text-[13.5px] font-bold text-surface-950">{title}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-surface-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Services ─────────────────────────────────────────────────── */}
        <section id="visits" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Our visits"
                title="What do you need checked?"
                description="Pick the closest match. You can add your own instructions to any visit."
              />
              <p className="max-w-xs text-[12.5px] leading-relaxed text-surface-500">
                Every visit is handled by an independent local inspector and checked
                against the same proof standard.
              </p>
            </div>

            <div className="mt-8">
              <RequesterServices />
            </div>

            <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-surface-200 bg-surface-100 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[13.5px] font-bold text-surface-950">
                  Standard visit ₹999 · Detailed visit ₹2,499
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-surface-600">
                  Pay per visit. UPI, cards, and international transfer options are
                  confirmed before the visit.
                </p>
              </div>
              <Button to="/#pricing" variant="secondary" size="sm" className="flex-shrink-0">
                Compare visits
              </Button>
            </div>
          </div>
        </section>

        {/* ─── Why owners use it ────────────────────────────────────────── */}
        <section className="border-b border-surface-200 bg-surface-100">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
            <SectionHeading
              eyebrow="What you get"
              title="Proof you can act on."
              description="Not a forwarded photo with no context. A visit record with the location, time, and notes attached."
            />

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {BENEFITS.map(({ label, copy, icon: Icon, visual }) => (
                <article
                  key={label}
                  className="overflow-hidden rounded-xl border border-surface-200 bg-white"
                >
                  <BenefitVisual visual={visual} />
                  <div className="p-5">
                    <h3 className="flex items-start gap-2 text-[15px] font-bold leading-snug text-surface-950">
                      <Icon size={16} className="mt-0.5 flex-shrink-0 text-primary-600" />
                      {label}
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-surface-600">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Inspector cross-sell ─────────────────────────────────────── */}
        <InspectorEarnBand />

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section className="border-b border-surface-200 bg-surface-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16 lg:px-8">
            <div>
              <SectionHeading
                eyebrow="Questions"
                title="Before you book."
                description={
                  <>
                    Write to{" "}
                    <a
                      href="mailto:hello@pinproof.in"
                      className="font-bold text-primary-700 underline underline-offset-4"
                    >
                      hello@pinproof.in
                    </a>{" "}
                    if your question is not here.
                  </>
                }
              />
            </div>
            <FaqAccordion items={FAQS} />
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────────────────── */}
        <section className="bg-accent-400">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-9 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <p className="eyebrow text-primary-800">Ready when you are</p>
              <h2 className="mt-3 text-[1.8rem] leading-[1.12] text-primary-950 sm:text-[2.1rem]">
                See your property this week.
              </h2>
              <p className="mt-2 text-[13px] font-medium text-primary-900/80">
                Pin it today. A local inspector handles the rest.
              </p>
            </div>
            <Button to="/verify/signup" variant="primary" className="flex-shrink-0">
              Book a property visit
              <ArrowRightIcon size={15} />
            </Button>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
