import {
  ClipboardIcon,
  CompassIcon,
  HomeIcon,
  MapPinIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "../components/Icons";

/**
 * Requester-facing visit menu. Shared by the home page and /verify so the
 * same six choices appear in the same order everywhere.
 */
export const REQUESTER_SERVICES = [
  {
    icon: MapPinIcon,
    title: "Plot and land",
    desc: "Boundaries, access, and what is actually on the site.",
  },
  {
    icon: HomeIcon,
    title: "Construction progress",
    desc: "See the stage before your next payment is due.",
  },
  {
    icon: ClipboardIcon,
    title: "Rental or possession",
    desc: "Condition, finishes, and snags before you commit.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Family property",
    desc: "A local check when you cannot be there yourself.",
  },
  {
    icon: SearchIcon,
    title: "Resale inspection",
    desc: "Look before you travel for a site visit.",
  },
  {
    icon: CompassIcon,
    title: "Shop or office",
    desc: "Frontage, access, and neighbourhood context.",
  },
];
