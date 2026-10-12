import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { normalizeLink } from "../utils/links";
import { useLanguage } from "../context/LanguageContext";

// Bangladesh's rough geographic center — used as the default map view.
const BD_CENTER = [23.7, 90.4];

// Keeps the map focused on Bangladesh. This is intentionally a plain,
// static configuration (fixed center/zoom + maxBounds) rather than an
// imperative fitBounds() call on mount — the imperative version depended
// on the container already having its final pixel size at the moment the
// effect ran, and when that timing assumption didn't hold (e.g. behind
// the blur/backdrop-filter effects elsewhere on the page) Leaflet fell
// back to its default world view instead of Bangladesh. A static zoom
// that's already known to be safe for a wide container has no such
// timing dependency, so it can't fail in that way.
const BD_BOUNDS = [
  [20.5, 88.0],
  [26.65, 92.75],
];
const DEFAULT_ZOOM = 9;
const SINGLE_POINT_ZOOM = 12;
const MIN_ZOOM = 9;
const MAX_ZOOM = 16;

function leafIcon(color) {
  return L.divIcon({
    className: "leaf-marker",
    html: `<svg width="30" height="34" viewBox="0 0 30 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 33 C 4 24, 2 12, 15 1 C 28 12, 26 24, 15 33 Z" fill="${color}" stroke="#F6F1E4" stroke-width="1.6"/>
      <path d="M15 5 L15 27" stroke="#F6F1E4" stroke-width="1.2" opacity="0.7"/>
    </svg>`,
    iconSize: [30, 34],
    iconAnchor: [15, 32],
    popupAnchor: [0, -30],
  });
}

const dealerIcon = leafIcon("#1F5C3D");
const distributorIcon = leafIcon("#E2A335");

/**
 * points: [{ _id, name, lat, lng, link, meta: string, kind: 'dealer' | 'distributor' }]
 * Clicking a pin opens a popup; the popup's "Visit" link redirects to point.link.
 */
export default function DealerMap({ points = [], height = 460 }) {
  const { t } = useLanguage();
  const validPoints = points.filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
  const singlePoint = validPoints.length === 1 ? [validPoints[0].lat, validPoints[0].lng] : null;

  // key forces a clean remount (not just a prop update) when switching
  // between the single-point and default views, since MapContainer only
  // reads center/zoom on its very first mount.
  return (
    <div className="map-wrap" style={{ height }}>
      <MapContainer
        key={singlePoint ? singlePoint.join(",") : "bd-overview"}
        center={singlePoint || BD_CENTER}
        zoom={singlePoint ? SINGLE_POINT_ZOOM : DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={BD_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validPoints.map((p) => (
          <Marker
            key={p._id}
            position={[p.lat, p.lng]}
            icon={p.kind === "distributor" ? distributorIcon : dealerIcon}
          >
            <Popup>
              <div className="map-popup__name">{p.name}</div>
              {p.meta && <div className="map-popup__meta">{p.meta}</div>}
              {p.link && (
                <a className="map-popup__link" href={normalizeLink(p.link)} target="_blank" rel="noreferrer">
                  {t("Visit / Contact")} &rarr;
                </a>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
