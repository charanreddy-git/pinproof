import { CheckCircleIcon, MapPinIcon, ShieldCheckIcon } from "./Icons";

/** A clearly labelled example of the proof shown after a visit. */
export function ProofPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[510px]">
      <div className="relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-2.5 sm:p-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-200">
          <img src="/property-960.webp" srcSet="/property-480.webp 480w, /property-960.webp 960w" sizes="(max-width: 639px) calc(100vw - 40px), 510px" width={960} height={960} alt="Example property exterior" className="h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-primary-950/85 via-primary-950/10 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-bold text-primary-900 shadow-sm">Example visit report</span>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white sm:bottom-5 sm:left-5 sm:right-5">
            <div>
              <p className="text-[13px] font-semibold text-white/85">Your property, in focus</p>
              <p className="mt-1 text-lg font-bold leading-tight">A closer look, wherever you are.</p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-400 text-primary-950"><MapPinIcon size={20} /></span>
          </div>
        </div>
        <div className="px-2 pb-2 pt-5 sm:px-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-primary-700">Visit evidence</p>
              <p className="mt-1 text-[17px] font-bold leading-tight text-surface-950">A photo with context</p>
              <p className="mt-1 text-[13px] text-surface-500">Photo, submission GPS, and capture method.</p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700"><ShieldCheckIcon size={19} /></span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-surface-200 pt-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-surface-700"><CheckCircleIcon size={15} className="text-primary-600" /> GPS checked</div>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-surface-700"><CheckCircleIcon size={15} className="text-primary-600" /> Saved to your account</div>
          </div>
        </div>
      </div>
    </div>
  );
}
