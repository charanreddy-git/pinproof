import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  id?: string;
}

export function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
  id,
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6 sm:p-7",
  };

  return (
    <div
      id={id}
      className={`
        rounded-2xl border border-surface-200 bg-white shadow-card
        ${hover ? "transition-colors duration-150 hover:border-primary-300 hover:shadow-card-hover" : ""}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
