import { Link, Outlet, useLocation } from "react-router-dom";
import { Logo } from "../components";
import { CheckIcon, MapPinIcon, ShieldCheckIcon } from "../components/Icons";

const STEPS = [
  {
    icon: MapPinIcon,
    title: "Pin the property",
    detail: "Share a Google Maps link or drop a pin.",
  },
  {
    icon: CheckIcon,
    title: "An inspector visits",
    detail: "Follow the trip live on the map.",
  },
  {
    icon: ShieldCheckIcon,
    title: "See the proof",
    detail: "Photo, location, and time in one place.",
  },
];

export function AuthLayout() {
  const isInspector = useLocation().pathname.startsWith("/captain");
  const steps = isInspector ? [
    { icon: MapPinIcon, title: "Find nearby work", detail: "Choose requests in an area you know." },
    { icon: CheckIcon, title: "Visit the property", detail: "Follow the requester’s notes and agreed scope." },
    { icon: ShieldCheckIcon, title: "Submit the proof", detail: "Send a photo with device GPS from the pin." },
  ] : STEPS;
  return (
    <div className="min-h-dvh bg-surface-50 lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative hidden overflow-hidden bg-primary-950 px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-14 xl:py-12">
        <div className="relative">
          <Logo size="md" variant="inverse" />
          <h2 className="mt-12 max-w-sm text-[2.5rem] leading-[1.12] xl:text-[3rem]">
            {isInspector ? <>Local visits.<br /><span className="text-accent-400">Useful work.</span></> : <>Your property.<br /><span className="text-accent-400">A closer look.</span></>}
          </h2>
          <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-primary-200">
            {isInspector ? "Help owners check properties they cannot get to. Choose nearby visits and agree the fee before accepting." : "Request a local property visit. Review the photo, submission location, and capture method in your account."}
          </p>

          <div className="mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent-400 text-primary-950">
              <MapPinIcon size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-accent-300">
                Submission GPS radius
              </p>
              <p className="display-number text-[1.55rem] leading-none text-white">100 metres</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[13px] font-bold text-primary-100">
              <ShieldCheckIcon size={11} className="text-accent-300" />
              Required
            </span>
          </div>

          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] font-semibold text-primary-100">
            <span>{isInspector ? "No joining fee" : "From ₹999"}</span>
            <span aria-hidden="true" className="text-primary-500">·</span>
            <span>No app needed</span>
            <span aria-hidden="true" className="text-primary-500">·</span>
            <span>Fees agreed separately</span>
          </p>
        </div>

        <div className="relative mt-10 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
          <div className="space-y-3">
            {steps.map(({ icon: Icon, title, detail }, index) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-300">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-white">
                    <span className="mr-1.5 text-primary-300">{index + 1}.</span>
                    {title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-primary-200">{detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-white/10 pt-3 text-[13px] font-medium text-primary-300">
            100 m GPS check. Private proof. Built for India.
          </p>
        </div>
      </aside>

      <main className="bg-surface-100 flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <p className="hidden text-[14px] font-semibold text-surface-500 lg:block">
            Welcome to PinProof
          </p>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-surface-600 transition-colors hover:text-surface-950"
          >
            Back to home
            <span aria-hidden="true" className="ml-1.5">↗</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-2 sm:px-8">
          <div className="relative w-full max-w-[460px] overflow-hidden rounded-2xl border border-surface-200 bg-white p-5 sm:p-7">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1.5 bg-accent-400"
            />
            <Outlet />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-6 text-[13px] font-medium text-surface-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheckIcon size={13} className="text-primary-600" />
            GPS-verified proof
          </span>
          <span>Private by default</span>
          <span>No app needed</span>
        </div>
      </main>
    </div>
  );
}
