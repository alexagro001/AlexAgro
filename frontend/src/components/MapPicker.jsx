import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const BD_CENTER = [23.7, 90.4];
const BD_BOUNDS = [
  [20.5, 88.0],
  [26.65, 92.75],
];
const BD_MIN_ZOOM = 9;

const pickerIcon = L.divIcon({
  className: "leaf-marker",
  html: `<svg width="30" height="34" viewBox="0 0 30 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 33 C 4 24, 2 12, 15 1 C 28 12, 26 24, 15 33 Z" fill="#1F5C3D" stroke="#F6F1E4" stroke-width="1.6"/>
  </svg>`,
  iconSize: [30, 34],
  iconAnchor: [15, 32],
});

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Click anywhere on the map to set the marker (and the lat/lng fields
 * in the admin form). Used when adding or editing a dealer / sales officer.
 */
export default function MapPicker({ lat, lng, onChange }) {
  const hasPoint = typeof lat === "number" && typeof lng === "number" && !Number.isNaN(lat);
  const center = hasPoint ? [lat, lng] : BD_CENTER;

  return (
    <div className="admin-mini-map">
      <MapContainer
        center={center}
        zoom={hasPoint ? 11 : 9}
        minZoom={BD_MIN_ZOOM}
        maxBounds={BD_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCatcher onPick={onChange} />
        {hasPoint && <Marker position={[lat, lng]} icon={pickerIcon} />}
      </MapContainer>
    </div>
  );
}
