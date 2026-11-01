import { CheckIcon, ShieldCheckIcon } from "./Icons";

/**
 * The proof standard, stated plainly. Kept short so it works as a mobile
 * trust card instead of pushing the next section far down the page.
 */
export function ProofStandardCard() {
  return (
    <div className="rounded-xl border border-primary-800 bg-primary-950 p-5 text-white sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-accent-300">
          <ShieldCheckIcon size={13} />
          The PinProof standard
        </p>
        <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-accent-300">
          Server-checked
        </span>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="display-number text-[4.4rem] leading-[0.8] sm:text-[5.2rem]">
          100
        </span>
        <span className="mb-1 text-[12px] font-bold text-accent-300">metres</span>
      </div>

      <p className="mt-4 text-[1.05rem] font-bold leading-snug">
        The furthest a proof photo can be from your pin.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/10 pt-3">
        {[
          "Rejected outside 100 m",
          "GPS and time saved",
          "Private to your account",
          "Not a forwarded photo",
        ].map((item) => (
          <p
            key={item}
            className="flex items-start gap-1.5 text-[11px] leading-snug text-primary-100"
          >
            <CheckIcon size={11} className="mt-0.5 flex-shrink-0 text-accent-400" />
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
