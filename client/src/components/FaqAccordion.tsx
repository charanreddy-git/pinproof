import { useId, useState } from "react";
import { ChevronDownIcon } from "./Icons";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-surface-200 border-y border-surface-200">
      {items.map((faq, index) => {
        const isOpen = activeIndex === index;
        const answerId = `${baseId}-answer-${index}`;

        return (
          <div key={faq.q}>
            <button
              type="button"
              onClick={() => setActiveIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={answerId}
              className="flex min-h-14 w-full items-center justify-between gap-4 px-1 py-4 text-left"
            >
              <span className="text-[15px] font-bold leading-snug text-surface-950 sm:text-[16px]">
                {faq.q}
              </span>
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-primary-700" : "text-surface-500"
                }`}
              >
                <ChevronDownIcon size={16} />
              </span>
            </button>
            {isOpen && (
              <div
                id={answerId}
                className="px-1 pb-5 pr-8 text-[14px] leading-[1.7] text-surface-600"
              >
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
