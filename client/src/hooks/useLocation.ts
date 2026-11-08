import { useState, useCallback } from "react";
import { sendTaskLocation } from "../services";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isTracking: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isTracking: false,
  });

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  }, []);

  const requestLocation = useCallback(async (): Promise<GeolocationPosition | null> => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      setState((prev) => ({
        ...prev,
        latitude,
        longitude,
        error: null,
      }));
      return position;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Location error",
      }));
      return null;
    }
  }, [getCurrentPosition]);

  const startTracking = useCallback(
    (taskId: string, intervalMs = 5000) => {
      setState((prev) => ({ ...prev, isTracking: true }));

      const sendUpdate = async () => {
        try {
          const position = await getCurrentPosition();
          const { latitude, longitude } = position.coords;
          setState((prev) => ({
            ...prev,
            latitude,
            longitude,
            error: null,
          }));
          void sendTaskLocation(taskId, latitude, longitude).catch((err) => {
            setState((prev) => ({
              ...prev,
              error:
                err instanceof Error
                  ? err.message
                  : "Could not share location",
            }));
          });
        } catch (err) {
          setState((prev) => ({
            ...prev,
            error: err instanceof Error ? err.message : "Location error",
          }));
        }
      };

      // Send immediately, then on interval
      sendUpdate();
      const interval = setInterval(sendUpdate, intervalMs);

      return () => {
        clearInterval(interval);
        setState((prev) => ({ ...prev, isTracking: false }));
      };
    },
    [getCurrentPosition]
  );

  return { ...state, getCurrentPosition, requestLocation, startTracking };
}
