import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  PageLoader,
  useToast,
  CompassIcon,
  CameraIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  CheckIcon,
  MapPinIcon,
} from "../../components";
import { useTaskDetail, useSubmitTask } from "../../hooks";

// Haversine distance (metres) between two coordinates.
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function UploadEvidencePage() {
  const { id } = useParams<{ id: string }>();
  const { data: task, isLoading, isError } = useTaskDetail(id!);
  const submitTask = useSubmitTask();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Camera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Photo
  const [captureSource, setCaptureSource] = useState<"CAMERA" | "UPLOAD">("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Location
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);
  const [locationAttempt, setLocationAttempt] = useState(0);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lockedLocation, setLockedLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
    capturedAt: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live GPS watch.
  useEffect(() => {
    if (!navigator.geolocation) {
      setTimeout(() => setLocationError("This browser cannot access your location."), 0);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationError(null);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location access is blocked. Allow location for this site in your browser settings."
            : "Could not get your location. Move to an open area and try again."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationAttempt]);

  // Camera manager.
  const startCamera = useCallback(
    async (facing: "user" | "environment" = "environment") => {
      setCameraError(null);
      try {
        if (activeStreamRef.current) {
          activeStreamRef.current.getTracks().forEach((track) => track.stop());
          activeStreamRef.current = null;
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        activeStreamRef.current = mediaStream;
        setIsCameraActive(true);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        const errorName = err instanceof Error ? err.name : "";
        let message = "Could not open the camera.";
        if (errorName === "NotAllowedError") {
          message = "Camera access is blocked. Allow camera access for this site, or upload a photo instead.";
        } else if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
          message = "No camera found on this device. You can upload a photo instead.";
        }
        setCameraError(message);
        setIsCameraActive(false);
        if (!preview) setUseFallback(true);
      }
    },
    [preview]
  );

  const stopCamera = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!useFallback && !preview && task) {
      timer = setTimeout(() => {
        startCamera(cameraFacingMode);
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
      stopCamera();
    };
  }, [useFallback, preview, cameraFacingMode, task, startCamera, stopCamera]);

  if (isLoading) return <PageLoader />;

  if (isError || !task) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-[14px] font-bold text-primary-700">Visit unavailable</p>
        <h1 className="mt-2 text-[2rem] font-extrabold tracking-[-0.035em] text-surface-950">
          We couldn’t find that visit.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-surface-600">
          It may no longer be available, or it may belong to another inspector.
        </p>
        <Button to="/captain/dashboard" className="mt-6">
          Back to find work
        </Button>
      </div>
    );
  }

  if (task.status !== "IN_PROGRESS") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-[14px] font-bold text-primary-700">Not open yet</p>
        <h1 className="mt-2 text-[2rem] font-extrabold tracking-[-0.035em] text-surface-950">
          Proof isn’t open for this visit.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-surface-600">
          {task.status === "ACCEPTED"
            ? "Start the visit first, then take your proof photo when you reach the property."
            : "This visit is already closed, or proof has already been submitted."}
        </p>
        <Button to={`/captain/tasks/${task.id}`} className="mt-6">
          Back to visit
        </Button>
      </div>
    );
  }

  const liveDistance = currentLocation
    ? calculateDistance(
        task.targetLat,
        task.targetLng,
        currentLocation.latitude,
        currentLocation.longitude
      )
    : null;

  const proofLocation = lockedLocation || currentLocation;
  const proofDistance = proofLocation
    ? calculateDistance(task.targetLat, task.targetLng, proofLocation.latitude, proofLocation.longitude)
    : null;

  const hasAccurateLocation = (proofLocation?.accuracy ?? Infinity) <= 100;
  const isInRange = proofDistance !== null && proofDistance <= 100 && hasAccurateLocation;
  const locationHint = !proofLocation ? "Allow location access to continue." : !hasAccurateLocation ? "GPS accuracy must be within 100 m. Retake or reselect the photo after GPS improves." : "Move within 100 m of the property to submit.";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      addToast("error", "Choose a JPG or PNG photo.");
      e.target.value = "";
      return;
    }
    if (selected.size > 4 * 1024 * 1024) {
      addToast("error", "That photo is over 4 MB. Choose a smaller file.");
      e.target.value = "";
      return;
    }

    setCaptureSource("UPLOAD");
    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
    if (currentLocation) {
      setLockedLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        capturedAt: new Date().toISOString(),
      });
    }
  };

  const toggleCameraFacing = () => {
    const next = cameraFacingMode === "user" ? "environment" : "user";
    setCameraFacingMode(next);
    startCamera(next);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    if (!currentLocation) {
      addToast("warning", "Waiting for GPS. Move to an open area.");
      return;
    }

    const video = videoRef.current;
    setCaptureSource("CAMERA");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");

    if (context) {
      if (cameraFacingMode === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPreview(canvas.toDataURL("image/jpeg", 0.95));
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setFile(
              new File([blob], `proof-${task.id}-${Date.now()}.jpg`, { type: "image/jpeg" })
            );
          }
        },
        "image/jpeg",
        0.95
      );
      setLockedLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        capturedAt: new Date().toISOString(),
      });
      stopCamera();
      addToast("success", "Photo captured");
    }
  };

  const retakePhoto = () => {
    setPreview(null);
    setFile(null);
    setLockedLocation(null);
    if (!useFallback) startCamera(cameraFacingMode);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const finalLocation =
      lockedLocation ||
      (currentLocation
        ? {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            accuracy: currentLocation.accuracy,
            capturedAt: new Date().toISOString(),
          }
        : null);

    if (!file) {
      addToast("error", "Take or upload a photo first.");
      return;
    }
    if (!finalLocation) {
      addToast("error", "GPS location is required to submit proof.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("latitude", finalLocation.latitude.toString());
      formData.append("longitude", finalLocation.longitude.toString());
      formData.append("evidenceSource", captureSource);
      if (captureSource === "CAMERA") formData.append("capturedAt", finalLocation.capturedAt);
      if (finalLocation.accuracy !== null) {
        formData.append("accuracy", finalLocation.accuracy.toString());
      }
      await submitTask.mutateAsync({ id: task.id, formData });
      addToast("success", "Proof submitted. The requester will review it.");
      navigate(`/captain/tasks/${task.id}`);
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Could not submit the proof. Please try again.";
      addToast("error", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl pb-28 sm:pb-0">
      <Button to={`/captain/tasks/${task.id}`} variant="ghost" size="sm" className="-ml-2 min-h-11">
        <span aria-hidden="true">←</span>
        Back to visit
      </Button>

      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-bold text-primary-700">Proof photo</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[13px] font-bold text-surface-500 shadow-sm">
            <ShieldCheckIcon size={10} className="text-primary-600" />
            GPS and photo check
          </span>
        </div>
        <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-[-0.025em] text-surface-950 sm:text-[2rem]">
          Take the proof photo
        </h1>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-surface-600">
          Stand at the property and take the photo here. The app records your GPS
          location and the time.
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {/* GPS status */}
        <section className="rounded-3xl border border-surface-200 bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-surface-700">
              <MapPinIcon size={14} className="text-primary-600" />
              Location check
            </p>
            {currentLocation && !locationError ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[13px] font-bold text-primary-700">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary-500" />
                GPS on
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-2.5 py-1 text-[13px] font-bold text-surface-500">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-surface-400" />
                {locationError ? "Unavailable" : "Locating"}
              </span>
            )}
          </div>

          {locationError ? (
            <div role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-danger-200 bg-danger-50 p-3">
              <AlertTriangleIcon size={15} className="mt-0.5 flex-shrink-0 text-danger-600" />
              <div><p className="text-[14px] font-medium leading-relaxed text-danger-700">{locationError}</p><Button variant="secondary" size="sm" className="mt-2" onClick={() => { setLocationError(null); setCurrentLocation(null); setLocationAttempt((attempt) => attempt + 1); }}>Retry location</Button></div>
            </div>
          ) : !currentLocation ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-50 p-3">
              <CompassIcon size={15} className="animate-spin-slow flex-shrink-0 text-surface-500" />
              <p className="text-[14px] text-surface-500">Getting your GPS location…</p>
            </div>
          ) : null}

          {proofDistance !== null ? (
            <div
              className={`mt-3 rounded-2xl border p-3.5 ${
                isInRange ? "border-primary-200 bg-primary-50" : "border-danger-200 bg-danger-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2">
                  {isInRange ? (
                    <CheckCircleIcon size={17} className="mt-0.5 flex-shrink-0 text-primary-700" />
                  ) : (
                    <AlertTriangleIcon size={17} className="mt-0.5 flex-shrink-0 text-danger-600" />
                  )}
                  <div>
                    <p className={`text-[13px] font-bold ${isInRange ? "text-primary-900" : "text-danger-700"}`}>
                      {isInRange ? "GPS is within the property radius" : !hasAccurateLocation ? "GPS accuracy is too low" : "You’re too far away"}
                    </p>
                    <p className={`mt-0.5 text-[13px] leading-relaxed ${isInRange ? "text-primary-800" : "text-danger-600"}`}>
                      {isInRange
                        ? "You can take and submit the proof photo."
                        : locationHint}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className={`whitespace-nowrap text-[1.8rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums ${isInRange ? "text-primary-800" : "text-danger-700"}`}>
                    {Math.round(proofDistance)}
                  </p>
                  <p className={`mt-0.5 whitespace-nowrap text-[13px] font-bold ${isInRange ? "text-primary-600" : "text-danger-500"}`}>
                    metres from pin
                  </p>
                </div>
              </div>

              {!lockedLocation && liveDistance !== null && liveDistance <= 100 && currentLocation?.accuracy && (
                <p className="mt-2 text-[13px] font-semibold text-primary-700">
                  GPS accuracy ±{Math.round(currentLocation.accuracy)} m
                </p>
              )}

              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/70">
                  <div
                    className={`h-full rounded-full transition-colors duration-150 ${
                      isInRange ? "bg-primary-600" : "bg-danger-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(4, (proofDistance / 100) * 100))}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-sm font-semibold">
                  <span className={isInRange ? "text-primary-600" : "text-danger-500"}>
                    0 m at pin
                  </span>
                  <span className={isInRange ? "text-primary-600" : "text-danger-500"}>
                    100 m proof limit
                  </span>
                </div>
              </div>
            </div>
          ) : currentLocation && proofLocation === null ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-warning-200 bg-warning-50 p-3">
              <CompassIcon size={15} className="flex-shrink-0 text-warning-600" />
              <p className="text-[14px] font-medium text-warning-800">Calculating distance…</p>
            </div>
          ) : null}

          <p className="mt-3 flex items-start gap-2 border-t border-surface-100 pt-2.5 text-[13px] leading-relaxed text-surface-500">
            <ShieldCheckIcon size={12} className="mt-0.5 flex-shrink-0 text-primary-600" />
            Submission GPS and accuracy are saved with the photo. Camera photos also include a device-reported capture time.
          </p>
        </section>

        {/* Camera / upload */}
        <section className="rounded-3xl border border-surface-200 bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-surface-700">
              <CameraIcon size={14} className="text-primary-600" />
              Photo
            </p>
            <button
              type="button"
              onClick={() => { setUseFallback(!useFallback); setPreview(null); setFile(null); setLockedLocation(null); }}
              className="inline-flex min-h-10 items-center rounded-full bg-surface-100 px-3 text-[13px] font-bold text-surface-700 transition-colors hover:bg-surface-200"
            >
              {useFallback ? "Use camera" : "Upload instead"}
            </button>
          </div>

          <p className="mt-3 text-sm text-surface-600">{useFallback ? "Uploaded images are labelled as uploads. Their original capture time and location are not verified." : "Camera photos save device-reported capture time and GPS. Submit within 15 minutes of capture."}</p>
          {(lockedLocation?.accuracy ?? currentLocation?.accuracy ?? 0) > 100 && <p role="alert" className="mt-3 text-sm text-warning-800">GPS accuracy is too low. Move to an open area and refresh your location before capturing again.</p>}
          <form id="evidence-form" onSubmit={handleSubmit} className="mt-3 space-y-4">
            {!useFallback ? (
              <div className="space-y-3">
                {preview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-surface-200 bg-surface-950">
                    <div className="flex aspect-video items-center justify-center">
                      <img src={preview} alt="Captured proof" className="h-full object-contain" />
                    </div>
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface-950/75 px-2.5 py-1 text-[13px] font-bold text-white backdrop-blur-sm">
                      <CheckIcon size={10} className="text-primary-300" />
                      Photo ready
                    </div>
                    {lockedLocation && (
                      <div className="absolute bottom-3 left-3 rounded-full bg-surface-950/75 px-2.5 py-1 text-[13px] font-semibold tabular-nums text-white backdrop-blur-sm">
                        {lockedLocation.latitude.toFixed(4)}, {lockedLocation.longitude.toFixed(4)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-2xl border border-surface-200 bg-surface-950">
                    <div className="flex aspect-video items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`h-full w-full object-cover ${cameraFacingMode === "user" ? "scale-x-[-1]" : ""}`}
                      />
                    </div>

                    {isCameraActive && (
                      <>
                        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface-950/60 px-2.5 py-1 text-[13px] font-bold text-white backdrop-blur-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                          Live
                        </div>
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-950/60 text-white backdrop-blur-sm transition-colors hover:bg-surface-950/80"
                          aria-label="Switch camera"
                        >
                          <RefreshCwIcon size={15} />
                        </button>
                      </>
                    )}

                    {cameraError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-950/95 p-6 text-center">
                        <CameraIcon size={25} className="mb-3 text-danger-400" />
                        <p className="text-[13px] font-bold text-white">Camera unavailable</p>
                        <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-surface-300">{cameraError}</p>
                        <div className="mt-4 flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => startCamera(cameraFacingMode)}
                          >
                            Try again
                          </Button>
                          <Button type="button" size="sm" onClick={() => setUseFallback(true)}>
                            Upload photo
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col items-center gap-2 py-2">
                  {preview ? (
                    <Button type="button" variant="secondary" size="sm" className="min-h-11" onClick={retakePhoto}>
                      <RefreshCwIcon size={13} />
                      Retake photo
                    </Button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!currentLocation || !!cameraError || !isCameraActive}
                        className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-4 border-white bg-white p-1 shadow-camera transition-transform active:scale-95 disabled:opacity-40"
                        aria-label="Take photo"
                      >
                        <span className={`block h-full w-full rounded-full ${currentLocation && !cameraError ? "bg-accent-500" : "bg-surface-300"}`} />
                      </button>
                      <p className="text-[13px] font-semibold text-surface-500">
                        {currentLocation ? "Tap to take the proof photo" : "Waiting for GPS…"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label
                  htmlFor="evidence-file"
                  className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition-colors ${
                    preview
                      ? "border-primary-300 bg-primary-50/40"
                      : "border-surface-300 bg-surface-50 hover:border-primary-400 hover:bg-primary-50/30"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="sr-only"
                    id="evidence-file"
                  />
                  {preview ? (
                    <div className="w-full space-y-3">
                      <img src={preview} alt="Selected proof" className="mx-auto max-h-48 rounded-xl object-contain" />
                      <p className="truncate text-[13px] font-medium text-surface-500">{file?.name}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={(event) => {
                          event.preventDefault();
                          retakePhoto();
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <CameraIcon size={21} className="text-primary-600" />
                      </div>
                      <p className="text-[13px] font-bold text-surface-800">Tap to choose a photo</p>
                      <p className="mt-1 text-[13px] font-medium text-surface-500">
                        JPG or PNG · max 4 MB
                      </p>
                      <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-surface-500">
                        The GPS distance check still applies to an uploaded photo.
                      </p>
                    </>
                  )}
                </label>
              </div>
            )}

            <div className="rounded-2xl bg-surface-50 p-3.5">
              <div className="flex items-start gap-2.5">
                <CameraIcon size={14} className="mt-0.5 flex-shrink-0 text-accent-600" />
                <div>
                  <p className="text-[13px] font-bold text-surface-700">
                    Before you shoot
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-surface-600">
                    Frame the property, not the street. Avoid faces and personal
                    documents.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["Property in frame", "No faces", "Good light"].map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[13px] font-bold text-surface-500 shadow-sm"
                      >
                        <CheckIcon size={9} className="text-primary-600" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button type="submit" isLoading={isSubmitting} disabled={!file || !isInRange} className="flex-1">
                Submit proof
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  stopCamera();
                  navigate(`/captain/tasks/${task.id}`);
                }}
              >
                Cancel
              </Button>
            </div>

            {file && !isInRange && (
              <p className="text-center text-[13px] font-semibold text-danger-700">
                {locationHint}
              </p>
            )}
          </form>
        </section>
      </div>

      {/* Sticky submit for small screens */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-200 bg-white/95 px-3 pt-3 bottom-safe backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className={`text-[13px] font-bold ${file && isInRange ? "text-primary-700" : "text-surface-500"}`}>
              {!file
                ? "Take or upload a photo"
                : !isInRange
                  ? !hasAccurateLocation ? "Improve GPS accuracy" : `Move within 100 m · ${proofDistance !== null ? `${Math.round(proofDistance)} m away` : "locating"}`
                  : "Photo ready to submit"}
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-surface-400">
              Device GPS and capture method are saved with the proof.
            </p>
          </div>
          <Button
            type="submit"
            form="evidence-form"
            isLoading={isSubmitting}
            disabled={!file || !isInRange}
            size="sm"
            className="min-h-11 flex-shrink-0 px-5"
          >
            Submit proof
          </Button>
        </div>
      </div>
    </div>
  );
}
