import { Link } from "react-router-dom";
import { REQUESTER_SERVICES } from "../content/marketing";
import { ArrowRightIcon } from "./Icons";

/** Compact, two-column visit menu for mobile-first landing pages. */
export function RequesterServices() {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
      {REQUESTER_SERVICES.map(({ icon: Icon, title, desc }) => (
        <Link
          key={title}
          to="/verify/signup"
          className="group rounded-lg border border-surface-200 bg-white p-4 transition-colors hover:border-primary-700 hover:bg-primary-50/30"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
              <Icon size={18} />
            </span>
            <ArrowRightIcon
              size={15}
              className="mt-1 text-surface-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-700"
            />
          </div>
          <p className="mt-2.5 text-[15px] font-bold leading-snug text-surface-950">
            {title}
          </p>
          <p className="mt-1 text-[14px] leading-snug text-surface-500">{desc}</p>
        </Link>
      ))}
    </div>
  );
}
