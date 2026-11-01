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
    title: "Plot & land",
    desc: "Boundaries, access, and site status.",
  },
  {
    icon: HomeIcon,
    title: "Construction",
    desc: "See the stage before you pay.",
  },
  {
    icon: ClipboardIcon,
    title: "Rental check",
    desc: "Condition and snags before you commit.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Family property",
    desc: "A local check when you are away.",
  },
  {
    icon: SearchIcon,
    title: "Resale check",
    desc: "Look before you travel.",
  },
  {
    icon: CompassIcon,
    title: "Shop / office",
    desc: "Frontage, access, and surroundings.",
  },
];
