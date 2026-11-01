import { CheckIcon, ShieldCheckIcon } from "./Icons";

/**
 * The proof standard, stated plainly. Used on marketing pages in place of a
 * fictional sample visit so the trust claim is concrete and verifiable.
 */
export function ProofStandardCard() {
  return (
    <div className="rounded-2xl border border-primary-800 bg-primary-950 p-5 text-white sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-300">
          <ShieldCheckIcon size={14} />
          The PinProof standard
        </p>
        <span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-accent-300 sm:inline">
          Server-checked
        </span>
      </div>

      <div className="mt-6 flex items-end gap-2">
        <span className="display-number text-[5.2rem] leading-[0.82] sm:text-[6rem]">
          100
        </span>
        <span className="mb-1.5 text-[13px] font-bold text-accent-300">metres</span>
      </div>

      <p className="mt-5 text-[1.15rem] font-bold leading-snug">
        The furthest a proof photo can be from your pin.
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-primary-200">
        If the photo is taken outside this radius, our server rejects it. The
        inspector cannot override the check.
      </p>

      <div className="mt-5 space-y-2.5 rounded-lg bg-white/[0.05] p-4">
        {[
          "Submitted inside PinProof, not forwarded",
          "GPS coordinates and accuracy saved",
          "Capture and submission times recorded",
          "Private to your account — never a public listing",
        ].map((item) => (
          <p
            key={item}
            className="flex items-start gap-2 text-[12.5px] leading-relaxed text-primary-100"
          >
            <CheckIcon size={12} className="mt-0.5 flex-shrink-0 text-accent-400" />
            {item}
          </p>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 text-[11.5px] font-semibold leading-relaxed text-primary-300">
        <ShieldCheckIcon size={13} className="mt-0.5 flex-shrink-0 text-accent-400" />
        A gallery upload is allowed only if the camera cannot be used. The location
        check still applies.
      </p>
    </div>
  );
}
