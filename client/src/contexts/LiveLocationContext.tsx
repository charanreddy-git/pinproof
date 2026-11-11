/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getLocationError } from "../hooks/useLocation";

export interface LiveFix {
  latitude: number;
  longitude: number;
  accuracy: number;
  updatedAt: number;
}

interface LiveLocationValue {
  fix: LiveFix | null;
  error: string | null;
  active: boolean;
  retry: () => void;
}

const LiveLocationContext = createContext<LiveLocationValue | null>(null);

/**
 * One geolocation watch for the whole inspector shell. The proof page and the
 * sharing bar both read this fix, so they never compete for the GPS provider.
 */
export function LiveLocationProvider({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const [fix, setFix] = useState<LiveFix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!active) {
      const timer = setTimeout(() => {
        setFix(null);
        setError(null);
      }, 0);
      return () => clearTimeout(timer);
    }

    if (!navigator.geolocation) {
      const timer = setTimeout(() => setError("This browser cannot access your location."), 0);
      return () => clearTimeout(timer);
    }

    let cancelled = false;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (cancelled) return;
        setFix({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          updatedAt: Date.now(),
        });
        setError(null);
      },
      (locationError) => {
        if (!cancelled) setError(getLocationError(locationError));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [active, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((value) => value + 1);
  }, []);

  const value = useMemo(
    () => ({ fix, error, active, retry }),
    [fix, error, active, retry]
  );

  return (
    <LiveLocationContext.Provider value={value}>
      {children}
    </LiveLocationContext.Provider>
  );
}

export function useLiveLocation(): LiveLocationValue {
  const value = useContext(LiveLocationContext);
  if (!value) {
    throw new Error("useLiveLocation must be used inside LiveLocationProvider");
  }
  return value;
}
