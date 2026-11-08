import { ClockIcon, ZapIcon } from "./Icons";

/**
 * Compact sample payout card. The number is the message; the breakdown is
 * kept to one line so the inspector hero stays short on mobile.
 */
export function EarningsCard() {
  return (
    <article className="overflow-hidden rounded-xl border border-surface-200 bg-white">
      <div className="flex items-center justify-between gap-3 bg-primary-950 px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
            <ZapIcon size={14} className="text-accent-300" />
          </span>
          <p className="text-[13.5px] font-bold leading-none">Illustrative earnings</p>
        </div>
        <span className="text-[13px] font-semibold text-accent-300">
          Sample
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <p className="display-number text-[2.9rem] leading-[0.85] text-surface-950">₹1,980</p>
          <p className="pb-1 text-[13px] font-semibold text-primary-700">Example total</p>
        </div>
        <p className="mt-2 text-[14px] font-medium text-surface-500">10 visits completed</p>

        <div className="mt-3 flex items-center justify-between gap-2 border-y border-surface-200 py-2.5 text-[13.5px] font-medium text-surface-600">
          <span>6 detailed</span>
          <span>4 quick checks</span>
        </div>

        <p className="mt-3 flex items-start gap-2 text-[13.5px] leading-relaxed text-surface-500">
          <ClockIcon size={13} className="mt-0.5 flex-shrink-0 text-accent-600" />
          Payments are arranged outside this website. No joining fee.
        </p>
      </div>
    </article>
  );
}
