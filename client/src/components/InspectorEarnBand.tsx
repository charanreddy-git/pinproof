import { Link } from "react-router-dom";
import { Button } from "./ui";
import { ArrowRightIcon } from "./Icons";

/**
 * Short cross-sell band for the inspector side. One promise, three pay
 * points, one action.
 */
export function InspectorEarnBand() {
  return (
    <section className="survey-grid-dark bg-primary-950">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-8">
        <div>
          <p className="eyebrow text-accent-300">For inspectors</p>
          <h2 className="mt-3 text-[1.9rem] leading-[1.12] text-white sm:text-[2.5rem]">
            Earn per visit.
          </h2>
          <p className="mt-2 max-w-md text-[15.5px] leading-relaxed text-primary-200">
            Check properties nearby. Get paid weekly.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Button to="/captain/signup" variant="accent">
              Start earning
              <ArrowRightIcon size={15} />
            </Button>
            <Link
              to="/captain"
              className="text-[14.5px] font-semibold text-primary-200 underline underline-offset-4 hover:text-white"
            >
              How it works
            </Link>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-3 divide-x divide-white/15 border-y border-white/15 py-3">
            {[
              ["₹120", "Quick check"],
              ["₹250", "Detailed"],
              ["₹500", "Priority"],
            ].map(([pay, label]) => (
              <div key={label} className="px-3 first:pl-0">
                <p className="display-number text-[1.45rem] leading-none text-white">{pay}</p>
                <p className="mt-1 text-[13px] font-medium text-primary-300">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] font-medium text-primary-300">
            Weekly settlement · No joining fee
          </p>
        </div>
      </div>
    </section>
  );
}
