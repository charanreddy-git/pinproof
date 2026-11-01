import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { MenuIcon, XIcon } from "./Icons";

interface NavItem {
  label: string;
  to: string;
  isAnchor?: boolean;
  isActive?: boolean;
}

interface MarketingHeaderProps {
  variant?: "primary" | "accent";
  logoLabel?: string;
  navItems?: NavItem[];
  ctaLabel?: string;
  ctaTo?: string;
}

export function MarketingHeader({
  variant = "primary",
  logoLabel = "PinProof",
  navItems = [],
  ctaLabel = "Book a visit",
  ctaTo = "/verify/signup",
}: MarketingHeaderProps) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.hash}`;
  const [mobileMenu, setMobileMenu] = useState({ open: false, routeKey: "" });
  const mobileOpen = mobileMenu.open && mobileMenu.routeKey === routeKey;
  const setMobileOpen = (open: boolean) => setMobileMenu({ open, routeKey });

  const isItemActive = (item: NavItem) => {
    if (item.isActive) return true;
    if (item.isAnchor) return false;
    if (item.to === "/") return location.pathname === "/";
    return location.pathname.startsWith(item.to);
  };

  const renderDesktopItem = (item: NavItem) => {
    const active = isItemActive(item);

    return item.isAnchor ? (
      <a
        key={item.to}
        href={item.to}
        className={`relative inline-flex min-h-11 items-center px-3 text-[14px] font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-1.5 after:h-px after:content-[''] ${
          active
            ? "text-surface-950 after:bg-primary-700"
            : "text-surface-600 after:bg-transparent hover:text-surface-950"
        }`}
      >
        {item.label}
      </a>
    ) : (
      <Link
        key={item.to}
        to={item.to}
        className={`relative inline-flex min-h-11 items-center px-3 text-[14px] font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-1.5 after:h-px after:content-[''] ${
          active
            ? "text-surface-950 after:bg-primary-700"
            : "text-surface-600 after:bg-transparent hover:text-surface-950"
        }`}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  };

  const mobileLink = (item: NavItem) => {
    const active = isItemActive(item);
    const className = `flex min-h-13 items-center justify-between border-l-2 px-4 py-3 text-[16px] font-semibold transition-colors ${
      active
        ? "border-primary-700 text-surface-950"
        : "border-transparent text-surface-800 hover:border-surface-300 hover:text-surface-950"
    }`;

    return item.isAnchor ? (
      <a key={item.to} href={item.to} onClick={() => setMobileOpen(false)} className={className}>
        {item.label}
        <span aria-hidden="true" className="text-surface-400">↗</span>
      </a>
    ) : (
      <Link
        key={item.to}
        to={item.to}
        onClick={() => setMobileOpen(false)}
        className={className}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
        <span aria-hidden="true" className="text-surface-400">→</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-surface-200/80 bg-surface-50/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-6 lg:px-8">
        <Logo variant={variant} label={logoLabel} size="sm" />

        {navItems.length > 0 && (
          <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
            {navItems.map(renderDesktopItem)}
          </nav>
        )}

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-surface-600 transition-colors hover:text-surface-950"
          >
            Sign in
          </Link>
          <Link
            to={ctaTo}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-accent-400 px-5 text-[14px] font-bold text-primary-950 transition-colors hover:bg-accent-300"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-surface-700"
          >
            Sign in
          </Link>
          {navItems.length > 0 && (
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-surface-700 transition-colors hover:bg-surface-100"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          )}
        </div>
      </div>

      {mobileOpen && navItems.length > 0 && (
        <div className="border-t border-surface-200 bg-surface-50 px-3 pb-5 pt-2 md:hidden">
          <nav className="mx-auto max-w-6xl space-y-1" aria-label="Mobile navigation">
            {navItems.map(mobileLink)}
          </nav>
          <Link
            to={ctaTo}
            onClick={() => setMobileOpen(false)}
            className="mt-3 flex h-13 items-center justify-center rounded-lg bg-accent-400 px-5 text-[16px] font-bold text-primary-950"
          >
            {ctaLabel}
          </Link>
          <p className="mt-3 text-center text-[13px] font-medium text-surface-500">
            Independent property visits · from ₹999
          </p>
        </div>
      )}
    </header>
  );
}
