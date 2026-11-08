import { useRef, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { pickIcon } from "./MapIcons";


interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

function ClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

function ChangeView({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => {
    // Zoom in when a location is chosen so the pin is easy to place accurately.
    map.setView([latitude, longitude], Math.max(map.getZoom(), 14));
  }, [latitude, longitude, map]);
  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationSelect,
  height = "350px",
}: LocationPickerProps) {
  // Centre of India — users can zoom in or paste a Google Maps link for accuracy.
  const defaultCenter: [number, number] = [22.5937, 78.9629];
  const position = latitude !== null && longitude !== null ? [latitude, longitude] as [number, number] : null;

  const markerRef = useRef<L.Marker | null>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onLocationSelect(latLng.lat, latLng.lng);
        }
      },
    }),
    [onLocationSelect]
  );

  return (
    <div className="space-y-2">
      <MapContainer
        center={position || defaultCenter}
        zoom={position ? 15 : 5}
        style={{ height, width: "100%" }}
        className="overflow-hidden"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onLocationSelect={onLocationSelect} />
        {position && (
          <>
            <ChangeView latitude={position[0]} longitude={position[1]} />
            <Marker
              draggable={true}
              eventHandlers={eventHandlers}
              position={position}
              ref={markerRef}
              icon={pickIcon}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
