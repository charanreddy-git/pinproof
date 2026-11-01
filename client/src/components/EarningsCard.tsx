import { ClockIcon, ZapIcon } from "./Icons";

/**
 * Illustrative weekly payout, clearly labelled as a sample. Used on the
 * inspector landing page and the cross-sell band on the customer page.
 */
export function EarningsCard() {
  return (
    <article className="overflow-hidden rounded-xl border border-surface-200 bg-white">
      <div className="flex items-center justify-between gap-3 bg-primary-950 px-4 py-3.5 text-white">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
            <ZapIcon size={16} className="text-accent-300" />
          </span>
          <div>
            <p className="text-[12.5px] font-bold leading-none">Weekly earnings</p>
            <p className="mt-1 text-[11px] font-medium text-primary-200">Bengaluru</p>
          </div>
        </div>
        <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-accent-300">
          Sample
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold text-surface-500">10 visits completed</p>
            <p className="mt-1 text-[1.3rem] font-bold leading-tight text-surface-950">
              This week’s payout
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-700">
            Settled
          </span>
        </div>

        <p className="mt-4 flex items-baseline gap-1 border-y border-surface-200 py-4">
          <span className="text-[1.2rem] font-bold text-surface-500">₹</span>
          <span className="display-number text-[3.1rem] leading-[0.85] text-surface-950">1,980</span>
        </p>

        <div className="mt-3">
          {[
            ["6 detailed visits", "₹1,500"],
            ["4 quick checks", "₹480"],
            ["Deductions", "None"],
          ].map(([label, value], index) => (
            <div
              key={label}
              className={`flex items-center justify-between gap-4 py-2 text-[12px] ${index > 0 ? "border-t border-surface-100" : ""}`}
            >
              <span className="font-medium text-surface-600">{label}</span>
              <span className="font-bold text-surface-900">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface-100 px-3 py-2.5">
          <ClockIcon size={13} className="mt-0.5 flex-shrink-0 text-accent-600" />
          <p className="text-[11.5px] leading-relaxed text-surface-600">
            Weekly settlement to bank or UPI. No joining fee, no minimum hours.
          </p>
        </div>
      </div>
    </article>
  );
}
