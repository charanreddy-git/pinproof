import { LocationPicker } from "../../components/LocationPicker";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VISIT_PLANS, type VisitPlan } from "../../content/visitPlans";
import { REQUESTER_SERVICES } from "../../content/marketing";
import {
  Button,
  Input,
  PageHeader,
  useToast,
  CheckIcon,
  MapPinIcon,
  CompassIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ClipboardIcon,
} from "../../components";
import { useCreateTask } from "../../hooks";
import { api } from "../../services";

const parseLocalCoordinates = (url: string) => {
  const patterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /[?&](?:query|q|ll|cbll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /\/place\/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];

  try { url = decodeURIComponent(url); } catch { return null; }
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const latIndex = 1;
      const latitude = parseFloat(match[latIndex]);
      const longitude = parseFloat(match[latIndex + 1]);
      if (Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
        return { latitude, longitude };
      }
      return null;
    }
  }

  return null;
};

const SUGGESTIONS = [
  "Check the boundary wall",
  "Show construction progress",
  "Confirm possession",
  "Check road access",
  "Check water and electricity",
  "Photograph the surroundings",
];

function StepCard({
  number,
  title,
  description,
  complete,
  children,
}: {
  number: string;
  title: string;
  description: string;
  complete: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-surface-200 bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold transition-colors ${
            complete
              ? "bg-primary-700 text-white"
              : "bg-primary-50 text-primary-800 ring-1 ring-primary-200"
          }`}
        >
          {complete ? <CheckIcon size={14} /> : number}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[1.2rem] font-extrabold leading-tight tracking-[-0.025em] text-surface-950 sm:text-[1.35rem]">
              {title}
            </h2>
            {complete && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[13px] font-bold text-primary-700">
                <CheckIcon size={9} />
                Done
              </span>
            )}
          </div>
          <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-surface-600">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const ListIconFallback = ClipboardIcon;

export function CreateTaskPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visitPlan, setVisitPlan] = useState<VisitPlan>(searchParams.get("plan") === "DETAILED" || searchParams.get("visitType") === "Detailed visit" ? "DETAILED" : "STANDARD");
  const propertyType = REQUESTER_SERVICES.find((service) => service.title === (searchParams.get("propertyType") || searchParams.get("visitType")))?.title;
  const quote = VISIT_PLANS[visitPlan];
  const [instructions, setInstructions] = useState(() => {
    const selected = REQUESTER_SERVICES.find((service) => service.title === (searchParams.get("propertyType") || searchParams.get("visitType")));
    return selected?.instructions ?? "";
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [mapsUrl, setMapsUrl] = useState("");
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const locationRequest = useRef(0);

  const createTask = useCreateTask();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const locationSelected = latitude !== null && longitude !== null;
  const instructionLength = instructions.trim().length;
  const notesReady = instructionLength >= 10;
  const ready = locationSelected && notesReady;
  const completedSteps = Number(locationSelected) + Number(notesReady);
  const previewTitle = (() => {
    const firstLine = instructions.trim().split("\n")[0]?.replace(/^•\s*/, "") ?? "";
    if (!firstLine) return "Your property visit";
    return firstLine.length > 60 ? `${firstLine.slice(0, 60).trim()}…` : firstLine;
  })();

  const handleResolveUrl = async () => {
    const requestId = ++locationRequest.current;
    setIsLocating(false);
    setUrlError(null);
    const trimmed = mapsUrl.trim();
    if (!trimmed) return;

    const localCoords = parseLocalCoordinates(trimmed);
    if (localCoords) {
      setLatitude(localCoords.latitude);
      setLongitude(localCoords.longitude);
      addToast("success", "Location set from the link");
      return;
    }

    setIsResolvingUrl(true);
    try {
      const response = await api.post<{
        success: boolean;
        data: { latitude: number; longitude: number };
      }>("/tasks/resolve-url", { url: trimmed });
      const { latitude: resolvedLat, longitude: resolvedLng } = response.data.data;
      if (requestId !== locationRequest.current) return;
      setLatitude(resolvedLat);
      setLongitude(resolvedLng);
      addToast("success", "Location set from the link");
    } catch (err) {
      if (requestId !== locationRequest.current) return;
      const errorMsg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Could not read that link. Open Google Maps, share the property, and copy the link again.";
      setUrlError(errorMsg);
    } finally {
      if (requestId === locationRequest.current) setIsResolvingUrl(false);
    }
  };

  const handleUseCurrentLocation = () => {
    const requestId = ++locationRequest.current;
    setIsResolvingUrl(false);
    if (!navigator.geolocation) {
      addToast("error", "Your browser cannot access location.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== locationRequest.current) return;
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLocating(false);
        addToast("success", "Using your current location");
      },
      () => {
        if (requestId !== locationRequest.current) return;
        setIsLocating(false);
        addToast("error", "Could not get your location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const toggleSuggestion = (suggestion: string) => {
    setInstructions((previous) => {
      if (previous.includes(suggestion)) {
        return previous
          .split("\n")
          .filter((line) => !line.includes(suggestion))
          .join("\n")
          .trim();
      }

      return previous.trim() ? `${previous.trim()}\n• ${suggestion}` : `• ${suggestion}`;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (createTask.isPending) return;

    if (instructionLength < 10) {
      addToast("error", "Please write at least 10 characters so the inspector knows what to check.");
      return;
    }

    if (latitude === null || longitude === null) {
      addToast("error", "Please set the property location first.");
      return;
    }

    const trimmedInstructions = instructions.trim();
    const firstLine = trimmedInstructions.split("\n")[0].replace(/^•\s*/, "");
    const title = firstLine.length < 3
      ? "Property visit"
      : firstLine.length > 60 ? `${firstLine.slice(0, 60).trim()}…` : firstLine;

    try {
      const task = await createTask.mutateAsync({
        title,
        visitPlan,
        propertyType,
        description: trimmedInstructions,
        latitude,
        longitude,
      });
      addToast("success", "Visit requested — we'll update you when an inspector accepts.");
      navigate(`/user/tasks/${task.id}`);
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Could not create the request. Please try again.";
      addToast("error", errorMsg);
    }
  };

  const steps = [
    { label: "Pin", done: locationSelected },
    { label: "Brief", done: notesReady },
    { label: "Send", done: ready },
  ];

  return (
    <div className="mx-auto max-w-5xl pb-28 sm:pb-0">
      <PageHeader
        backTo="/user"
        backLabel="Home"
        eyebrow="Takes about 2 minutes"
        title="Book a property visit"
        description="Set the exact pin and tell us what to check. A local inspector takes it from there."
        meta={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[14px] font-semibold text-surface-700 shadow-sm">
            <ShieldCheckIcon size={12} className="text-primary-600" />
            From ₹999 · pay per visit
          </span>
        }
      />

      <div className="fixed inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom,0px))] z-30 border-t border-surface-200 bg-white px-4 py-3 shadow-bottom-nav sm:hidden">
        <p className="mb-2 text-sm text-surface-700" aria-live="polite">{!locationSelected ? "Next: set the property pin" : !notesReady ? "Next: add inspection notes" : `${quote.label}: ₹${quote.price.toLocaleString("en-IN")} quoted`}</p>
        <Button form="create-visit-form" type="submit" className="w-full" isLoading={createTask.isPending} disabled={!ready}>Request visit</Button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
        <form id="create-visit-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-surface-200 bg-white p-3.5 shadow-sm sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold text-surface-700">
                {completedSteps === 2 ? "Ready to send" : `${completedSteps} of 2 details added`}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[13px] font-bold ${
                  ready ? "bg-primary-50 text-primary-700" : "bg-surface-100 text-surface-500"
                }`}
              >
                {ready ? "All set" : "Draft"}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {steps.map((step, index) => (
                <div key={step.label} className="flex flex-1 items-center gap-1.5">
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ${
                      step.done
                        ? "bg-primary-700 text-white"
                        : index === completedSteps
                          ? "bg-accent-400 text-primary-950"
                          : "bg-surface-100 text-surface-400"
                    }`}
                  >
                    {step.done ? <CheckIcon size={9} /> : index + 1}
                  </span>
                  <span
                    className={`text-[13px] font-bold ${
                      step.done ? "text-primary-800" : "text-surface-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <span className="mx-1 hidden h-px flex-1 bg-surface-200 sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <StepCard
            number="1"
            title="Where is the property?"
            description="The inspector travels to this exact pin — not the neighbourhood. A Google Maps link is the easiest way to get it right."
            complete={locationSelected}
          >
            <div className="space-y-4">
              <div className="rounded-2xl bg-surface-50 p-3.5">
                <Input
                  label="Google Maps link"
                  value={mapsUrl}
                  onChange={(e) => {
                    locationRequest.current += 1;
                    setIsResolvingUrl(false);
                    setIsLocating(false);
                    setMapsUrl(e.target.value);
                    setUrlError(null);
                    setLatitude(null);
                    setLongitude(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (mapsUrl.trim() && !isResolvingUrl) void handleResolveUrl();
                    }
                  }}
                  placeholder="Paste the property link here"
                  id="maps-url-input"
                  helperText="In Google Maps: search the property → Share → Copy link."
                />
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <Button
                    type="button"
                    onClick={handleResolveUrl}
                    isLoading={isResolvingUrl}
                    disabled={!mapsUrl.trim()}
                    size="sm"
                    className="min-h-11"
                  >
                    Find this location
                  </Button>
                  {locationSelected && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-1 text-[13px] font-bold text-primary-800">
                      <CheckIcon size={11} />
                      Location set
                    </span>
                  )}
                </div>
                {urlError && (
                  <p role="alert" className="mt-2 text-[14px] font-medium leading-relaxed text-danger-700">
                    {urlError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-surface-200" />
                <span className="text-[13px] font-semibold text-surface-400">or</span>
                <span className="h-px flex-1 bg-surface-200" />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[14px] font-bold text-surface-700">
                    Tap the exact spot on the map, then drag the pin to fine-tune it
                  </p>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary-50 px-3 text-[13px] font-bold text-primary-800 transition-colors hover:bg-primary-100 disabled:opacity-50"
                  >
                    <CompassIcon size={13} />
                    {isLocating ? "Finding you…" : "Use my location"}
                  </button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-surface-200">
                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationSelect={(lat, lng) => {
                      locationRequest.current += 1;
                      setIsResolvingUrl(false);
                      setIsLocating(false);
                      setLatitude(lat);
                      setLongitude(lng);
                    }}
                    height="280px"
                  />
                </div>

                {locationSelected ? (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary-50 px-3.5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-800">
                      <MapPinIcon size={12} />
                      Pin set
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums text-primary-700">
                      {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-surface-500">
                    <MapPinIcon size={12} />
                    No pin set yet. Use a link or tap the map.
                  </p>
                )}
              </div>
            </div>
          </StepCard>

          <StepCard
            number="2"
            title="What should the inspector check?"
            description="Be specific. The inspector follows these notes on site, so write them like you’re briefing someone at the gate."
            complete={notesReady}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <label
                  htmlFor="task-instructions"
                  className="text-[14px] font-bold text-surface-700"
                >
                  Notes for the inspector
                </label>
                <span
                  className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[13px] font-bold ${
                    notesReady
                      ? "bg-primary-50 text-primary-700"
                      : "bg-surface-100 text-surface-500"
                  }`}
                >
                  {notesReady ? "Looks good" : `${10 - instructionLength} more characters`}
                </span>
              </div>
              <textarea
                id="task-instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="For example: Check the boundary wall, photograph the main gate, and confirm the road is approachable by car."
                maxLength={5000}
                required
                rows={6}
                className="w-full resize-none rounded-2xl border-2 border-surface-200 bg-surface-50 px-4 py-3 text-base leading-relaxed text-surface-900 transition-colors placeholder:text-surface-400 hover:border-surface-300 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 sm:text-[14px]"
              />

              <div className="h-1.5 overflow-hidden rounded-full bg-surface-100" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-primary-600"
                  style={{ width: `${Math.min(100, (instructionLength / 40) * 100)}%` }}
                />
              </div>

              <div>
                <p className="text-[13px] font-bold text-surface-500">Quick add</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((suggestion) => {
                    const selected = instructions.includes(suggestion);
                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => toggleSuggestion(suggestion)}
                        aria-pressed={selected}
                        className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors ${
                          selected
                            ? "border-primary-300 bg-primary-50 text-primary-800"
                            : "border-surface-200 bg-white text-surface-600 hover:border-primary-300 hover:bg-primary-50/40"
                        }`}
                      >
                        {selected ? (
                          <CheckIcon size={11} />
                        ) : (
                          <span aria-hidden="true" className="text-[13px] leading-none">+</span>
                        )}
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="rounded-xl bg-surface-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-surface-500">
                Please don’t include private information like bank details. The inspector only checks what is visible or safe to access.
              </p>
            </div>
          </StepCard>

          <div className="flex items-start gap-2.5 rounded-2xl border border-primary-200 bg-primary-50 p-3.5">
            <ShieldCheckIcon size={16} className="mt-0.5 flex-shrink-0 text-primary-700" />
            <p className="text-[13px] leading-relaxed text-primary-900/80">
              <strong className="font-bold text-primary-900">
                Proof within 100 metres.
              </strong>{" "}
              The inspector’s device must report a location within 100 m of this pin. Photos are labelled as camera captures or uploaded images; device-reported GPS is saved with the submission.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 px-1 pb-2 lg:hidden">
            <p className="text-[13px] font-medium text-surface-500">
              Check the pin and notes before sending
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/user")}>
              Cancel
            </Button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-card">
            <div className="border-b border-surface-100 px-4 py-3.5">
              <p className="text-sm font-semibold text-surface-500">
                Visit summary
              </p>
            </div>

            <div className="p-4">
              <div className="rounded-2xl bg-surface-50 p-3.5">
                <p className="line-clamp-2 text-[14px] font-bold leading-snug text-surface-900">
                  {previewTitle}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-surface-500">
                  <MapPinIcon size={11} className="text-primary-600" />
                  {locationSelected && latitude !== null && longitude !== null
                    ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                    : "Property pin not set"}
                </p>
              </div>

              <dl className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-3 text-[13px]">
                  <dt className="flex items-center gap-1.5 font-medium text-surface-500">
                    <MapPinIcon size={12} />
                    Property pin
                  </dt>
                  <dd className={`font-bold ${locationSelected ? "text-primary-700" : "text-surface-400"}`}>
                    {locationSelected ? "Set" : "Required"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-[13px]">
                  <dt className="flex items-center gap-1.5 font-medium text-surface-500">
                    <ListIconFallback size={12} />
                    Inspector brief
                  </dt>
                  <dd className={`font-bold ${notesReady ? "text-primary-700" : "text-surface-400"}`}>
                    {notesReady ? "Ready" : `${instructionLength}/10 min`}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-2xl border border-primary-200 bg-primary-50/70 p-3.5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <label htmlFor="visit-plan" className="text-sm font-bold text-primary-800">Visit plan</label>
                    <select id="visit-plan" value={visitPlan} onChange={(e) => { setVisitPlan(e.target.value as VisitPlan); const next = new URLSearchParams(searchParams); next.set("plan", e.target.value); setSearchParams(next, { replace: true }); }} className="mt-2 block min-h-11 w-full rounded-lg bg-white px-2 text-sm">
                      {Object.entries(VISIT_PLANS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                    </select>
                    <p className="mt-1 text-[13px] font-medium leading-snug text-primary-700/80">
                      {quote.description}
                    </p>
                  </div>
                  <p className="display-number text-[1.7rem] leading-none text-primary-950">₹{quote.price.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <Button
                type="submit"
                form="create-visit-form"
                variant="accent"
                size="lg"
                isLoading={createTask.isPending}
                disabled={!ready}
                className="mt-3 w-full"
              >
                {ready ? "Request visit" : "Add pin and notes to continue"}
                {ready && <ArrowRightIcon size={16} />}
              </Button>
              <p className="mt-2 text-center text-[13px] leading-relaxed text-surface-500">
                Quoted fee. Payment is not collected here. Your request will be visible to nearby inspectors.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-surface-500">
              What happens next
            </p>
            <ol className="mt-3 space-y-2.5">
              {[
                ["A local inspector accepts", "Your visit status updates when someone accepts."],
                ["Follow the visit live", "Track the trip on the map."],
                ["Review the proof", "Photo, GPS, and time in one place."],
              ].map(([title, detail], index) => (
                <li key={title} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-[13px] font-extrabold text-primary-700">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-[13px] font-bold text-surface-800">{title}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-surface-500">{detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
