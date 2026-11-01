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
          <p className="text-[12px] font-bold leading-none">Sample weekly payout</p>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-accent-300">
          Sample
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <p className="display-number text-[2.9rem] leading-[0.85] text-surface-950">₹1,980</p>
          <p className="pb-1 text-[11px] font-bold text-primary-700">Settled</p>
        </div>
        <p className="mt-2 text-[11.5px] font-medium text-surface-500">10 visits completed</p>

        <div className="mt-3 flex items-center justify-between gap-2 border-y border-surface-200 py-2.5 text-[11px] font-medium text-surface-600">
          <span>6 detailed</span>
          <span>4 quick checks</span>
          <span className="font-bold text-surface-900">No deductions</span>
        </div>

        <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-surface-500">
          <ClockIcon size={12} className="mt-0.5 flex-shrink-0 text-accent-600" />
          Settled weekly to bank or UPI. No joining fee.
        </p>
      </div>
    </article>
  );
}
