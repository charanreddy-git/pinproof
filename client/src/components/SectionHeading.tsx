import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}

/**
 * Section header with the short marigold rule used across the marketing
 * pages. Keeps every section scannable without adding decorative chrome.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
  className = "",
  titleClassName = "",
}: SectionHeadingProps) {
  const isDark = tone === "dark";
  const isCentered = align === "center";

  return (
    <div
      className={`${isCentered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}
    >
      {eyebrow && (
        <p className={`eyebrow ${isDark ? "text-accent-400" : "text-primary-700"}`}>
          {eyebrow}
        </p>
      )}
      <h2
        className={`mt-3 text-[2rem] leading-[1.1] sm:text-[2.7rem] ${
          isDark ? "text-white" : "text-surface-950"
        } ${titleClassName}`}
      >
        {title}
      </h2>
      <span
        aria-hidden="true"
        className={`mt-4 block h-1 w-12 bg-accent-400 ${isCentered ? "mx-auto" : ""}`}
      />
      {description && (
        <p
          className={`mt-4 text-[14px] leading-[1.7] ${
            isDark ? "text-primary-200" : "text-surface-600"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
