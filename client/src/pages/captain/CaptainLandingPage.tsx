import { Link } from "react-router-dom";
import {
  MarketingHeader,
  MarketingFooter,
  Button,
  FaqAccordion,
  SectionHeading,
  EarningsCard,
  CheckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  MapPinIcon,
  CameraIcon,
  CompassIcon,
  ZapIcon,
  ClipboardIcon,
} from "../../components";

const NAV_ITEMS = [
  { label: "How it works", to: "#how-it-works", isAnchor: true },
  { label: "Pay", to: "#pay", isAnchor: true },
  { label: "Requirements", to: "#requirements", isAnchor: true },
  { label: "FAQ", to: "#faq", isAnchor: true },
];

const VISIT_TYPES = [
  {
    icon: MapPinIcon,
    name: "Quick check",
    payout: "120",
    turnaround: "Same day",
    desc: "Exterior photo, vacant plots, and shop-front checks.",
    includes: "One proof photo · GPS check-in",
    tint: "bg-primary-50 text-primary-700",
    popular: false,
  },
  {
    icon: ClipboardIcon,
    name: "Detailed visit",
    payout: "250",
    turnaround: "Within 24 hours",
    desc: "Rental checks, construction progress, and neighbourhood visits.",
    includes: "One proof photo · custom checklist",
    tint: "bg-accent-50 text-accent-700",
    popular: true,
  },
  {
    icon: ZapIcon,
    name: "Priority inspection",
    payout: "500",
    turnaround: "Priority",
    desc: "Longer checklists for time-sensitive requests.",
    includes: "One proof photo · priority visit",
    tint: "bg-warning-50 text-warning-700",
    popular: false,
  },
];

const STEPS = [
  {
    icon: CompassIcon,
    title: "Find a nearby request",
    desc: "Open the app and see property visits available around you.",
  },
  {
    icon: MapPinIcon,
    title: "Travel to the pin",
    desc: "Accept the visit and follow directions to the exact location.",
  },
  {
    icon: CameraIcon,
    title: "Take the proof photo",
    desc: "Capture it inside PinProof, within 100 m of the pin. Location and time attach automatically.",
  },
  {
    icon: CheckIcon,
    title: "Get paid",
    desc: "The requester reviews the proof. Payouts are settled weekly to your bank account or UPI ID.",
  },
];

const NEEDS = [
  "Smartphone with GPS",
  "Working camera",
  "Bike, scooter, or car",
  "Mobile data for tracking",
];

const FAQS = [
  {
    q: "How do I earn as an inspector?",
    a: "Accept a property visit from your dashboard, travel to the location, and submit a proof photo through the app. The visit is paid after the requester reviews and completes it.",
  },
  {
    q: "How much can I earn per visit?",
    a: "Quick checks start at ₹120, detailed visits at ₹250, and priority inspections at ₹500. The base payout is listed with each visit type, with no joining fees.",
  },
  {
    q: "When do I get paid?",
    a: "Payouts are settled weekly to your bank account or UPI ID. There is no minimum payout threshold.",
  },
  {
    q: "What do I need to start?",
    a: "A smartphone with a working camera and GPS, mobile data, and a bike, scooter, or car to reach the property. PinProof works in your browser — no app download is required.",
  },
  {
    q: "Do I have to accept every visit?",
    a: "No. You choose the visits that suit your location and schedule. There are no joining fees or minimum hours.",
  },
];

const REASONS = [
  {
    title: "Your hours, your area",
    copy: "Open the app when you want work. Accept nearby visits that fit your route and schedule. No shifts, no minimum hours.",
    visual: "week",
  },
  {
    title: "Know the pay before you go",
    copy: "Every visit shows its base payout before you accept. No bidding, no deductions, no chasing a lead.",
    visual: "pay",
  },
  {
    title: "Settled every week",
    copy: "Completed visits are paid to your bank account or UPI at the end of the week. No minimum payout threshold.",
    visual: "settle",
  },
] as const;

function ReasonVisual({ visual }: { visual: (typeof REASONS)[number]["visual"] }) {
  if (visual === "week") {
    return (
      <div className="flex h-44 flex-col justify-center bg-primary-950 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent-300">
          Your week
        </p>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
            const active = index === 1 || index === 3 || index === 5;
            return (
              <div
                key={`${day}-${index}`}
                className={`flex h-14 flex-col items-center justify-center rounded-md text-[11px] font-bold ${
                  active
                    ? "bg-accent-400 text-primary-950"
                    : "border border-white/15 text-primary-300"
                }`}
              >
                {day}
                <span className={`mt-1 text-[7px] font-semibold ${active ? "text-primary-900/70" : "text-primary-400/60"}`}>
                  {active ? "ON" : "—"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[10.5px] leading-relaxed text-primary-200">
          Accept only the days and visits that suit you.
        </p>
      </div>
    );
  }

  if (visual === "pay") {
    return (
      <div className="flex h-44 flex-col justify-center bg-accent-50 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent-800">
          Detailed visit
        </p>
        <p className="display-number mt-1 text-[2.8rem] leading-none text-surface-950">₹250</p>
        <div className="mt-3 space-y-1.5 border-t border-accent-200 pt-2 text-[10.5px]">
          <p className="flex items-center justify-between gap-3">
            <span className="text-surface-700">Listed before you accept</span>
            <CheckIcon size={12} className="text-primary-700" />
          </p>
          <p className="flex items-center justify-between gap-3">
            <span className="text-surface-700">Deductions</span>
            <span className="font-bold text-surface-950">None</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-44 flex-col justify-center bg-surface-100 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-700">
        Weekly settlement
      </p>
      <p className="display-number mt-1 text-[2.2rem] leading-none text-surface-950">Friday</p>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-surface-300 pt-2 text-[10.5px]">
        <span className="text-surface-700">Bank account or UPI</span>
        <span className="font-bold text-surface-950">No minimum</span>
      </div>
      <p className="mt-2 text-[10.5px] leading-relaxed text-surface-500">
        Completed visits are settled at the end of the week.
      </p>
    </div>
  );
}

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
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-8 lg:py-20">
            <div>
              <p className="eyebrow text-accent-300">For inspectors</p>

              <h1 className="mt-4 text-[2.7rem] leading-[1.04] tracking-[-0.02em] text-white sm:text-[3.6rem] lg:text-[4.1rem]">
                Earn per visit.
                <br />
                <span className="text-accent-400">Work your way.</span>
              </h1>

              <p className="mt-5 max-w-[32rem] text-[16px] leading-[1.7] text-primary-200 sm:text-[17px]">
                Check properties near you, take a GPS-verified photo, and get paid.
                No joining fee, no fixed hours, and no app download.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button to="/captain/signup" variant="accent" size="lg" className="w-full sm:w-auto">
                  Start earning
                  <ArrowRightIcon size={17} />
                </Button>
                <a
                  href="#pay"
                  className="inline-flex min-h-12 items-center justify-center gap-2 px-1 text-[14px] font-semibold text-primary-100 transition-colors hover:text-white sm:justify-start"
                >
                  See what visits pay
                  <span aria-hidden="true" className="text-primary-400">↓</span>
                </a>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-3 divide-x divide-white/15 border-y border-white/15">
                {[
                  ["₹120+", "per visit"],
                  ["Weekly", "settlement"],
                  ["₹0", "joining fee"],
                ].map(([value, label]) => (
                  <div key={label} className="px-3 py-3.5 first:pl-0">
                    <p className="text-[14px] font-bold leading-tight text-white">{value}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-primary-300">{label}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 flex items-center gap-2 text-[12.5px] font-semibold text-primary-300">
                <CheckIcon size={14} className="text-accent-400" />
                No shifts · No minimum hours · Works in your browser
              </p>
            </div>

            <div>
              <EarningsCard />
              <p className="mt-3 text-center text-[10.5px] font-medium text-primary-300">
                Illustrative earnings · not a payout promise
              </p>
            </div>
          </div>
        </section>

        {/* ─── Pay ──────────────────────────────────────────────────────── */}
        <section id="pay" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="What a visit pays"
                title="Clear pay before you accept."
                description="The base payout is fixed for each visit type. No deductions, no surprises at settlement."
              />
              <p className="max-w-xs text-[12.5px] leading-relaxed text-surface-500">
                Your payout is shown on the visit card, so you can decide before you
                start travelling.
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {VISIT_TYPES.map(({ icon: Icon, name, payout, turnaround, desc, includes, tint, popular }) => (
                <article
                  key={name}
                  className={`relative flex flex-col rounded-xl border bg-white p-5 ${
                    popular ? "border-primary-700" : "border-surface-200"
                  }`}
                >
                  {popular && (
                    <span className="absolute right-4 top-4 bg-accent-400 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-primary-950">
                      Most common
                    </span>
                  )}
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}>
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-3 text-[1.05rem] font-bold text-surface-950">{name}</h3>
                  <p className="mt-1 flex-1 text-[12.5px] leading-relaxed text-surface-600">{desc}</p>

                  <div className="mt-4 border-t border-surface-200 pt-3">
                    <p className="flex items-baseline gap-1">
                      <span className="display-number text-[2.4rem] leading-none text-surface-950">
                        ₹{payout}
                      </span>
                      <span className="text-[11px] font-semibold text-surface-500">/ visit</span>
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-primary-700">
                      {turnaround} · {includes}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
              <ShieldCheckIcon size={16} className="mt-0.5 flex-shrink-0 text-primary-700" />
              <p className="max-w-3xl text-[11.5px] leading-relaxed text-primary-900">
                <strong className="font-bold">The proof standard is fixed too.</strong>{" "}
                Photos must be taken within 100 m of the pin. The server checks it, so
                there is no disputing the location later.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Why inspect ──────────────────────────────────────────────── */}
        <section className="border-b border-surface-200 bg-surface-100">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
            <SectionHeading
              eyebrow="Built for your day"
              title="Work that fits around life."
              description="Pick up visits between other errands, or make a morning of it. You decide when to switch on."
            />

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {REASONS.map(({ title, copy, visual }) => (
                <article
                  key={title}
                  className="overflow-hidden rounded-xl border border-surface-200 bg-white"
                >
                  <ReasonVisual visual={visual} />
                  <div className="p-5">
                    <h3 className="text-[15px] font-bold leading-snug text-surface-950">{title}</h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-surface-600">{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works + requirements ──────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-16 lg:px-8">
            <div>
              <SectionHeading
                eyebrow="The visit"
                title="Four steps. One clean proof."
                description="You are not selling a listing or chasing a lead. You go to the pin, record what is there, and submit it."
              />

              <ol className="mt-7">
                {STEPS.map(({ icon: Icon, title, desc }, index) => (
                  <li
                    key={title}
                    className="flex gap-4 border-t border-surface-200 py-4 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-800 text-[12px] font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="flex items-center gap-2 text-[13.5px] font-bold text-surface-950">
                        <Icon size={15} className="text-primary-600" />
                        {title}
                      </h3>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-surface-600">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <aside
              id="requirements"
              className="scroll-mt-20 self-start rounded-xl border border-surface-200 bg-white p-5 sm:p-6"
            >
              <p className="eyebrow text-primary-700">What you need</p>
              <h2 className="mt-3 text-[1.6rem] leading-[1.15] text-surface-950">
                A phone, a camera, and a way to get there.
              </h2>
              <p className="mt-2 text-[12.5px] leading-relaxed text-surface-600">
                No app download, no joining fee, and no fixed hours.
              </p>

              <div className="mt-4 divide-y divide-surface-200 border-y border-surface-200">
                {NEEDS.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 py-2.5 text-[13px] font-semibold text-surface-800"
                  >
                    <CheckIcon size={14} className="flex-shrink-0 text-primary-600" />
                    {item}
                  </div>
                ))}
              </div>

              <p className="mt-4 border-l-2 border-primary-700 pl-3 text-[11.5px] font-medium leading-relaxed text-primary-800">
                PinProof runs in the browser · no install required
              </p>

              <Button to="/captain/signup" variant="accent" className="mt-5 w-full">
                Join as an inspector
                <ArrowRightIcon size={15} />
              </Button>
            </aside>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16 lg:px-8">
            <div>
              <SectionHeading
                eyebrow="Questions"
                title="Inspector questions."
                description={
                  <>
                    Still unsure? Write to{" "}
                    <a
                      href="mailto:field@pinproof.in"
                      className="font-bold text-primary-700 underline underline-offset-4"
                    >
                      field@pinproof.in
                    </a>
                    .
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
                Start earning nearby.
              </h2>
              <p className="mt-2 text-[13px] font-medium text-primary-900/80">
                Create your account and find visits in your area.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <Button to="/captain/signup" variant="primary" className="flex-shrink-0">
                Join as an inspector
                <ArrowRightIcon size={15} />
              </Button>
              <Link
                to="/verify"
                className="inline-flex min-h-11 items-center px-1 text-[12.5px] font-semibold text-primary-900 underline underline-offset-4 hover:text-primary-950"
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
