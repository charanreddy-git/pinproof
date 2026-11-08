import { Link } from "react-router-dom";
import { REQUESTER_SERVICES } from "../content/marketing";
import { ArrowRightIcon } from "./Icons";

/** A browsable list of the kinds of properties an inspector can visit. */
export function RequesterServices() {
  return (
    <div className="grid border-t border-surface-300 sm:grid-cols-2 lg:grid-cols-3">
      {REQUESTER_SERVICES.map(({ icon: Icon, title, desc }) => (
        <Link
          key={title}
          to={`/user/create-task?propertyType=${encodeURIComponent(title)}`}
          className="group flex min-h-36 items-start gap-4 border-b border-surface-300 px-1 py-6 transition-colors hover:bg-primary-50/60 sm:px-4"
        >
          <Icon size={23} className="mt-1 shrink-0 text-primary-700" />
          <span className="min-w-0 flex-1">
            <span className="block text-[18px] font-bold leading-tight text-surface-950">{title}</span>
            <span className="mt-2 block text-[15px] leading-relaxed text-surface-600">{desc}</span>
          </span>
          <ArrowRightIcon size={18} className="mt-1 shrink-0 text-primary-700 transition-transform group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  );
}
