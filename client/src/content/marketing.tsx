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
    instructions: "Plot & land: Photograph the boundary, entrance, and road access. Note any visible occupation or damage.",
  },
  {
    icon: HomeIcon,
    title: "Construction",
    desc: "See the stage before you pay.",
    instructions: "Construction: Photograph the current construction stage and visible work on site. Note any obvious damage or access issues.",
  },
  {
    icon: ClipboardIcon,
    title: "Rental check",
    desc: "Condition and snags before you commit.",
    instructions: "Rental check: Photograph the entrance and visible condition. Check for damage and arrange access before inspecting inside.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Family property",
    desc: "A local check when you are away.",
    instructions: "Family property: Photograph the entrance and exterior. Note any visible damage or maintenance needs.",
  },
  {
    icon: SearchIcon,
    title: "Resale check",
    desc: "Look before you travel.",
    instructions: "Resale check: Photograph the exterior, entrance, and surroundings. Note visible condition and road access.",
  },
  {
    icon: CompassIcon,
    title: "Shop / office",
    desc: "Frontage, access, and surroundings.",
    instructions: "Shop / office: Photograph the frontage, entrance, and road access. Note the visible condition and surroundings.",
  },
];
