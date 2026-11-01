import { Link } from "react-router-dom";
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
  ArrowRightIcon,
  MapPinIcon,
  CameraIcon,
  ShieldCheckIcon,
  ClockIcon,
  CompassIcon,
  IndianRupeeIcon,
  HomeIcon,
} from "../components";

const NAV_ITEMS = [
  { label: "How it works", to: "#how-it-works", isAnchor: true },
  { label: "Visits", to: "#visits", isAnchor: true },
  { label: "Pricing", to: "#pricing", isAnchor: true },
  { label: "For inspectors", to: "/captain" },
];

const FAQS = [
  {
    q: "How do I show you which property to visit?",
    a: "Paste a Google Maps link or drop a pin on the exact spot. That pin is what the inspector travels to — a street address is helpful, but not required. It works for plots, gated communities, and properties you have never seen in person.",
  },
  {
    q: "How do I know the photo came from my property?",
    a: "Proof is submitted inside PinProof with the photo's GPS coordinates, accuracy, and timestamp attached. Our server measures the distance from your pin and rejects anything taken more than 100 metres away. You see the result on the visit page.",
  },
  {
    q: "Who can see my photos and location?",
    a: "Only the people on that visit. Proof stays in your private dashboard and is never published as a listing. Your phone number is used to sign you in and coordinate the visit.",
  },
  {
    q: "Do I need to be in India or install an app?",
    a: "No. Requesters and inspectors both use PinProof in a mobile or desktop browser. You can book from anywhere, follow the visit on the map, and review the proof from your dashboard.",
  },
];

const STEPS = [
  {
    icon: MapPinIcon,
    step: "1",
    title: "Pin the property",
    desc: "Paste a Google Maps link or tap the exact spot. Add a note about what you want checked.",
    time: "About 2 minutes",
    tint: "bg-primary-50 text-primary-700",
  },
  {
    icon: CompassIcon,
    step: "2",
    title: "An inspector goes",
    desc: "An independent local inspector accepts the visit. You can follow the trip on the map.",
    time: "Most visits start within hours",
    tint: "bg-accent-50 text-accent-700",
  },
  {
    icon: CameraIcon,
    step: "3",
    title: "You get the proof",
    desc: "A dated, GPS-checked photo and a clear visit summary arrive in your dashboard.",
    time: "Usually within 24–48 hours",
    tint: "bg-success-50 text-success-700",
  },
];

const PLANS = [
  {
    name: "Standard visit",
    price: "999",
    desc: "For a basic exterior check at the property.",
    time: "Usually within 24–48 hours",
    popular: false,
    features: [
      "Exterior check at your pin",
      "One GPS-verified photo",
      "Visit summary in your dashboard",
      "Live visit tracking",
    ],
  },
  {
    name: "Detailed visit",
    price: "2,499",
    desc: "For a longer checklist and priority matching.",
    time: "Priority — usually within 12 hours",
    popular: true,
    features: [
      "Everything in Standard",
      "Your own checklist for the inspector",
      "Priority inspector matching",
      "Same 100 m proof standard",
    ],
  },
];

const COMMITMENTS = [
  "Proof must be submitted inside PinProof",
  "Location is checked by our server, not the inspector",
  "Photos stay private to your account",
  "One flat fee, agreed before the visit",
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
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-8 lg:py-20">
            <div>
              <p className="eyebrow text-primary-800">
                Property visits across India
              </p>

              <h1 className="mt-4 text-[2.7rem] leading-[1.04] tracking-[-0.02em] text-surface-950 sm:text-[3.6rem] lg:text-[4.1rem]">
                See your property.
                <br />
                <span className="text-primary-700">From anywhere.</span>
              </h1>

              <p className="mt-5 max-w-[33rem] text-[16px] leading-[1.7] text-surface-600 sm:text-[17px]">
                An independent local inspector visits your plot, flat, or construction
                site. You get a dated photo with GPS coordinates checked by our server
                — without making the trip.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button to="/verify/signup" variant="accent" size="lg" className="w-full sm:w-auto">
                  Book a property visit
                  <ArrowRightIcon size={17} />
                </Button>
                <a
                  href="#how-it-works"
                  className="inline-flex min-h-12 items-center justify-center gap-2 px-1 text-[14px] font-semibold text-surface-700 transition-colors hover:text-surface-950 sm:justify-start"
                >
                  See how it works
                  <span aria-hidden="true" className="text-surface-400">↓</span>
                </a>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-semibold text-surface-600">
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon size={14} className="text-primary-600" />
                  From ₹999 per visit
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon size={14} className="text-primary-600" />
                  100 m GPS check
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon size={14} className="text-primary-600" />
                  No app download
                </span>
              </div>

              <p className="mt-6 text-[13px] leading-relaxed text-surface-500">
                Questions before booking? Write to{" "}
                <a
                  href="mailto:hello@pinproof.in"
                  className="font-bold text-primary-700 underline underline-offset-4"
                >
                  hello@pinproof.in
                </a>
                . A real person replies.
              </p>
            </div>

            <div>
              <ProofStandardCard />
              <p className="mt-3 text-center text-[10.5px] font-medium text-surface-500">
                The same standard applies to every visit.
              </p>
            </div>
          </div>

          <div className="border-y border-surface-200 bg-white/60">
            <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-surface-200 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
              {[
                { icon: ShieldCheckIcon, value: "Server-checked", label: "location, not a claim" },
                { icon: ClockIcon, value: "24–48 hours", label: "typical turnaround" },
                { icon: IndianRupeeIcon, value: "₹999", label: "flat, per visit" },
                { icon: CameraIcon, value: "No app", label: "works in your browser" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={value} className="flex items-center gap-2.5 px-3 py-4 sm:px-5">
                  <Icon size={18} className="hidden flex-shrink-0 text-primary-600 sm:block" />
                  <div>
                    <p className="text-[13px] font-bold leading-tight text-surface-900">{value}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-surface-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Services ─────────────────────────────────────────────────── */}
        <section id="visits" className="scroll-mt-20 border-b border-surface-200 bg-surface-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Our visits"
                title="One visit. Whatever you need checked."
                description="From a vacant plot to a flat you have never seen, start with the closest match and add your own instructions."
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
                  Pay per visit. No subscription, no travel surcharge, no hidden fees.
                </p>
              </div>
              <Button to="#pricing" variant="secondary" size="sm" className="flex-shrink-0">
                Compare visits
              </Button>
            </div>
          </div>
        </section>

        {/* ─── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-20 border-b border-surface-200 bg-surface-100">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="How it works"
                title="Three steps. One verified record."
                description="You pin the property, an independent inspector goes, and the proof comes back to your dashboard."
              />
              <p className="max-w-xs text-[12px] font-medium leading-relaxed text-surface-500">
                No phone tag, no bargaining, and no forwarded photos with no context.
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, step, title, desc, time, tint }) => (
                <article key={step} className="rounded-xl border border-surface-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${tint}`}>
                      <Icon size={20} />
                    </span>
                    <span className="display-number text-[2.2rem] leading-none text-surface-200">{step}</span>
                  </div>
                  <h3 className="mt-4 text-[1.15rem] font-bold text-surface-950">{title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-surface-600">{desc}</p>
                  <p className="mt-4 border-t border-surface-200 pt-3 text-[10.5px] font-semibold text-primary-700">
                    {time}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pricing ──────────────────────────────────────────────────── */}
        <section id="pricing" className="scroll-mt-20 border-b border-surface-200 bg-accent-50/70">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Simple pricing"
                title="One visit. One flat fee."
                description="No subscription, no travel surcharge, no hidden fees."
              />
              <p className="max-w-xs text-[12.5px] leading-relaxed text-surface-600">
                Pay per visit. UPI, cards, and international transfer options are
                confirmed before the visit.
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative flex flex-col rounded-xl border p-5 sm:p-6 ${
                    plan.popular
                      ? "border-primary-950 bg-primary-950 text-white"
                      : "border-surface-200 bg-white text-surface-950"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute right-5 top-5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-300">
                      Most requested
                    </span>
                  )}
                  <h3 className={`text-[1.15rem] font-bold ${plan.popular ? "text-white" : "text-surface-950"}`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-1 max-w-xs text-[12.5px] leading-relaxed ${plan.popular ? "text-primary-200" : "text-surface-500"}`}>
                    {plan.time}
                  </p>

                  <div className={`mt-4 flex items-baseline gap-1 border-y py-4 ${plan.popular ? "border-white/15" : "border-surface-200"}`}>
                    <span className={`display-number text-[2.7rem] leading-none ${plan.popular ? "text-white" : "text-surface-950"}`}>
                      ₹{plan.price}
                    </span>
                    <span className={`pb-1 text-[11px] font-semibold ${plan.popular ? "text-primary-300" : "text-surface-500"}`}>
                      / visit
                    </span>
                  </div>

                  <p className={`mt-3 text-[13px] leading-relaxed ${plan.popular ? "text-primary-200" : "text-surface-600"}`}>
                    {plan.desc}
                  </p>

                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-2 text-[12.5px] font-medium ${plan.popular ? "text-primary-100" : "text-surface-700"}`}
                      >
                        <CheckIcon
                          size={13}
                          className={`mt-0.5 flex-shrink-0 ${plan.popular ? "text-accent-400" : "text-primary-600"}`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    to="/verify/signup"
                    variant={plan.popular ? "accent" : "secondary"}
                    className="mt-5 w-full"
                  >
                    Book this visit
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Inspector cross-sell ─────────────────────────────────────── */}
        <InspectorEarnBand />

        {/* ─── FAQ + commitments ────────────────────────────────────────── */}
        <section className="border-b border-surface-200 bg-surface-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:px-8">
            <div>
              <SectionHeading
                eyebrow="Common questions"
                title="Straight answers."
                description={
                  <>
                    Write to{" "}
                    <a
                      href="mailto:hello@pinproof.in"
                      className="font-bold text-primary-700 underline underline-offset-4"
                    >
                      hello@pinproof.in
                    </a>
                    . A real person replies.
                  </>
                }
              />

              <div className="mt-6 border-l-2 border-primary-700 bg-white px-4 py-4">
                <p className="flex items-center gap-2 text-[12px] font-bold text-surface-900">
                  <ShieldCheckIcon size={15} className="text-primary-600" />
                  Our commitments
                </p>
                <ul className="mt-3 space-y-2">
                  {COMMITMENTS.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[12.5px] leading-relaxed text-surface-600"
                    >
                      <CheckIcon size={12} className="mt-0.5 flex-shrink-0 text-primary-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <FaqAccordion items={FAQS} />
          </div>
        </section>

        {/* ─── Two ways in ──────────────────────────────────────────────── */}
        <section className="bg-surface-100">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <SectionHeading
              align="center"
              eyebrow="Two ways to use PinProof"
              title="Whichever side you are on."
            />

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              <Link
                to="/verify/signup"
                className="group flex flex-col justify-between gap-6 rounded-xl border border-surface-200 bg-white p-6 transition-colors hover:border-primary-700"
              >
                <div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <HomeIcon size={20} />
                  </span>
                  <h3 className="mt-4 text-[1.3rem] font-bold text-surface-950">
                    Need a property checked?
                  </h3>
                  <p className="mt-2 max-w-md text-[13px] leading-relaxed text-surface-600">
                    Book a local inspector, follow the visit, and keep the proof in one
                    private dashboard.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-[13px] font-bold text-primary-700">
                  Book a visit
                  <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                to="/captain/signup"
                className="group flex flex-col justify-between gap-6 rounded-xl border border-surface-200 bg-white p-6 transition-colors hover:border-accent-500"
              >
                <div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                    <CompassIcon size={20} />
                  </span>
                  <h3 className="mt-4 text-[1.3rem] font-bold text-surface-950">
                    Want to earn on the go?
                  </h3>
                  <p className="mt-2 max-w-md text-[13px] leading-relaxed text-surface-600">
                    Accept nearby property visits, photograph the site, and get settled
                    every week. No joining fee.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-[13px] font-bold text-accent-800">
                  Join as an inspector
                  <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
