import { Link } from "react-router-dom";
import { REQUESTER_SERVICES } from "../content/marketing";
import { ArrowRightIcon } from "./Icons";

/** The six-visit menu, shared by the home page and the requester landing page. */
export function RequesterServices() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {REQUESTER_SERVICES.map(({ icon: Icon, title, desc }) => (
        <Link
          key={title}
          to="/verify/signup"
          className="group flex min-h-[132px] items-start gap-3.5 rounded-xl border border-surface-200 bg-white p-4 transition-colors hover:border-primary-700 hover:bg-primary-50/30"
        >
          <span className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
            <Icon size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-start justify-between gap-2">
              <span className="text-[14px] font-bold text-surface-950">{title}</span>
              <ArrowRightIcon
                size={15}
                className="mt-0.5 flex-shrink-0 text-surface-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-700"
              />
            </span>
            <span className="mt-1 block text-[12.5px] leading-relaxed text-surface-600">
              {desc}
            </span>
            <span className="mt-3 block text-[10px] font-bold uppercase tracking-[0.12em] text-primary-700">
              From ₹999
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
