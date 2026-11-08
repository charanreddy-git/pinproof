import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: "primary" | "accent" | "dark" | "secondary" | "inverse" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: ReactNode;
  to?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  to,
  href,
  type = "button",
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-xl font-bold tracking-normal transition-[background-color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none cursor-pointer no-underline whitespace-nowrap active:scale-[0.98]";

  const variantClasses = {
    primary:
      "bg-accent-400 text-primary-950 hover:bg-accent-300 active:bg-accent-500",
    accent:
      "bg-accent-400 text-primary-950 hover:bg-accent-300 active:bg-accent-500",
    dark:
      "bg-primary-950 text-white hover:bg-primary-800",
    secondary:
      "bg-white text-primary-900 border border-surface-300 hover:border-primary-700 hover:bg-primary-50/40",
    inverse:
      "bg-white text-primary-950 hover:bg-accent-50",
    danger:
      "bg-danger-600 text-white hover:bg-danger-700",
    ghost:
      "text-surface-600 hover:text-primary-900 hover:bg-surface-100",
  };

  const sizeClasses = {
    sm: "min-h-11 h-11 px-4 text-[14px] gap-1.5",
    md: "min-h-12 h-12 px-5 text-[15px] gap-2",
    lg: "min-h-14 h-14 px-6 text-[16px] gap-2",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const spinner = (
    <svg className="h-4 w-4 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  const content = (
    <>
      {isLoading && spinner}
      {children}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {content}
    </button>
  );
}
