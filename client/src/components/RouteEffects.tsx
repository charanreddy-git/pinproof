import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PAGE_TITLES: Record<string, string> = {
  "/": "PinProof — Property verification without the travel",
  "/verify": "Request a property visit — PinProof",
  "/captain": "Inspect properties near you — PinProof",
  "/login": "Sign in — PinProof",
  "/register": "Create your account — PinProof",
  "/verify/signup": "Request a property visit — PinProof",
  "/captain/signup": "Join as an inspector — PinProof",
  "/user": "Your requests — PinProof",
  "/user/create-task": "Request a visit — PinProof",
  "/user/tasks": "Your requests — PinProof",
  "/captain/dashboard": "Find inspection work — PinProof",
  "/captain/accepted": "Your visits — PinProof",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/captain/tasks/") && pathname.endsWith("/upload")) return "Submit proof — PinProof";
  if (pathname.startsWith("/user/tasks/")) return "Visit details — PinProof";
  if (pathname.startsWith("/user/track/")) return "Live visit tracking — PinProof";
  if (pathname.startsWith("/captain/tasks/")) return "Visit details — PinProof";
  return "Page not found — PinProof";
}

/** Resets scroll on route changes, honours in-page anchors, and keeps tab titles useful. */
export function RouteEffects() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    document.title = getTitle(pathname);

    if (hash) {
      // Wait for the target section to mount before scrolling to it.
      const timer = window.setTimeout(() => {
        const target = document.querySelector(hash);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
