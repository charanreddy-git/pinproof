import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { targetIcon, captainIcon } from "./MapIcons";
import { useLiveLocation } from "../hooks";
import { MapPinIcon, NavigationIcon } from "./Icons";

interface LiveTrackerProps {
  taskId: string;
  targetLat: number;
  targetLng: number;
  height?: string;
  active?: boolean;
}

function distanceMetres(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(metres: number): string {
  if (metres < 100) return "At the property";
  if (metres < 1000) return `${Math.round(metres)} m away`;
  return `${(metres / 1000).toFixed(1)} km away`;
}

function FitBounds({
  target,
  captain,
}: {
  target: [number, number];
  captain: [number, number] | null;
}) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (captain && !hasFitted.current) {
      map.fitBounds(L.latLngBounds([target, captain]), { padding: [56, 56], maxZoom: 16 });
      hasFitted.current = true;
    }
    if (!captain) hasFitted.current = false;
  }, [captain, target, map]);

  return null;
}

export function LiveTracker({
  taskId,
  targetLat,
  targetLng,
  height = "500px",
  active = true,
}: LiveTrackerProps) {
  const { location: liveLocation, isConnected } = useLiveLocation(taskId, active);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 5000); return () => clearInterval(timer); }, []);
  const ageSeconds = liveLocation ? Math.max(0, Math.floor((now - Date.parse(liveLocation.timestamp)) / 1000)) : null;
  const isFresh = active && isConnected && ageSeconds !== null && ageSeconds < 90;
  const connectionLabel = !active ? "Tracking inactive" : !isConnected ? "Reconnecting" : ageSeconds === null ? "Waiting for location" : isFresh ? "Live" : "Location out of date";
  const captainPos: [number, number] | null = liveLocation
    ? [liveLocation.latitude, liveLocation.longitude]
    : null;
  const lastUpdated = liveLocation ? new Date(liveLocation.timestamp) : null;

  const targetPos: [number, number] = [targetLat, targetLng];
  const distance = captainPos
    ? distanceMetres(targetLat, targetLng, captainPos[0], captainPos[1])
    : null;

  return (
    <div className="flex flex-col bg-surface-50">
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-surface-600">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-accent-500 ring-1 ring-accent-500" />
            Property
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-surface-600">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-700 ring-1 ring-primary-700" />
            Inspector
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[13px] font-bold text-primary-700">
            100 m proof zone
          </span>
          <span role="status" className={`rounded-full px-3 py-1 text-sm font-semibold ${isFresh ? "bg-success-50 text-success-700" : "bg-warning-50 text-warning-800"}`}>{connectionLabel}</span>
          {lastUpdated && (
            <span className="text-[13px] font-medium text-surface-500">
              Location received {ageSeconds! < 60 ? `${ageSeconds}s` : `${Math.floor(ageSeconds! / 60)} min`} ago
            </span>
          )}
        </div>
      </div>

      {!isFresh && captainPos && <p className="bg-warning-50 px-4 py-3 text-sm text-warning-800">Showing the last reported position. It may no longer be the inspector’s current location.</p>}
      {/* Distance strip */}
      {distance !== null && (
        <div className="flex items-center gap-2 bg-primary-50 px-4 py-2">
          <NavigationIcon size={13} className="flex-shrink-0 text-primary-700" />
          <p className="text-[13px] font-semibold text-primary-900">
            {formatDistance(distance)}
            {distance > 100 && (
              <span className="ml-1 font-medium text-primary-700">
                · proof photos only within 100 m
              </span>
            )}
          </p>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={targetPos}
        zoom={15}
        style={{ height, width: "100%", borderRadius: 0 }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={targetPos} icon={targetIcon}>
          <Popup>Property location</Popup>
        </Marker>
        <Circle
          center={targetPos}
          radius={100}
          pathOptions={{
            color: "#218f5c",
            fillColor: "#218f5c",
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: "6, 4",
          }}
        />

        {captainPos && (
          <Marker position={captainPos} icon={captainIcon}>
            <Popup>
              Inspector location
              {liveLocation && (
                <span className="mt-1 block text-[13px] text-surface-500">
                  Updated:{" "}
                  {new Date(liveLocation.timestamp).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </Popup>
          </Marker>
        )}

        <FitBounds target={targetPos} captain={captainPos} />
      </MapContainer>

      {/* Waiting state */}
      {!captainPos && (
        <div className="flex items-start gap-2 border-t border-surface-100 px-4 py-3">
          <MapPinIcon size={13} className="mt-0.5 flex-shrink-0 text-primary-600" />
          <p className="text-[13px] leading-relaxed text-surface-500">
            Waiting for the inspector to start sharing their location. This page
            updates automatically. No need to refresh.
          </p>
        </div>
      )}
    </div>
  );
}
