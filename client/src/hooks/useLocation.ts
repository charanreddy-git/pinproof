import { useState, useCallback } from "react";

export function getLocationError(error: unknown): string {
  const code = (error as { code?: number })?.code;
  if (code === 1) return "Location access is blocked. Allow location for this site in your browser settings, then retry.";
  if (code === 2) return "Your location is unavailable. Move to an open area and retry.";
  if (code === 3) return "Getting your location timed out. Move to an open area and retry.";
  return error instanceof Error ? error.message : "Could not get your location. Please retry.";
}

/**
 * Resolve a single fresh fix. Some browsers starve one-shot geolocation
 * requests (especially while another watch is active), so ask through a watch
 * and stop it as soon as the first fix arrives.
 */
export function getCurrentPosition(options: PositionOptions = {}): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("This browser cannot access your location."));
    let settled = false;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (settled) return;
        settled = true;
        navigator.geolocation.clearWatch(watchId);
        resolve(position);
      },
      (error) => {
        if (settled) return;
        settled = true;
        navigator.geolocation.clearWatch(watchId);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
    );
  });
}

export function useGeolocation() {
  const [state, setState] = useState<{ latitude: number | null; longitude: number | null; error: string | null }>({ latitude: null, longitude: null, error: null });
  const requestLocation = useCallback(async () => {
    try {
      const position = await getCurrentPosition();
      setState({ latitude: position.coords.latitude, longitude: position.coords.longitude, error: null });
      return position;
    } catch (error) {
      setState((previous) => ({ ...previous, error: getLocationError(error) }));
      return null;
    }
  }, []);
  return { ...state, requestLocation, getCurrentPosition };
}
