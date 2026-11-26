import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const GEOJSON_URL = "/data/bd-districts.geojson";

const DIVISION_COLORS = {
  Dhaka: "#1f5c3d",
  Chattogram: "#e2a335",
  Chittagong: "#e2a335",
  Rajshahi: "#c9793a",
  Khulna: "#2f7a52",
  Barishal: "#8fbf3f",
  Barisal: "#8fbf3f",
  Sylhet: "#5a9e3f",
  Rangpur: "#6fae46",
  Mymensingh: "#e0b93a",
  default: "#4da45b",
};
const SELECTED_COLOR = "#e2a335";
const VIEW = 700; // SVG coordinate size of the longer side
const PAD = 10;
const ZOOM = 2.2;

function colorFor(name) {
  return DIVISION_COLORS[name] || DIVISION_COLORS[name?.replace(" Division", "")] || DIVISION_COLORS.default;
}

// Turns the GeoJSON into ready-to-draw SVG paths (done once after loading).
function buildGeometry(geo) {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  const walk = (c) => {
    if (typeof c[0] === "number") {
      minLon = Math.min(minLon, c[0]);
      maxLon = Math.max(maxLon, c[0]);
      minLat = Math.min(minLat, c[1]);
      maxLat = Math.max(maxLat, c[1]);
    } else c.forEach(walk);
  };
  geo.features.forEach((f) => f.geometry && walk(f.geometry.coordinates));

  const kx = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const lonSpan = (maxLon - minLon) * kx;
  const latSpan = maxLat - minLat;
  const k = VIEW / Math.max(lonSpan, latSpan);
  const project = (lon, lat) => [(lon - minLon) * kx * k + PAD, (maxLat - lat) * k + PAD];
  const viewW = lonSpan * k + PAD * 2;
  const viewH = latSpan * k + PAD * 2;

  const districts = [];
  for (const f of geo.features) {
    if (!f.geometry) continue;
    const name = f.properties?.ADM2_EN || "District";
    const division = f.properties?.ADM1_EN || "Bangladesh";
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;

    let d = "";
    let bestArea = 0;
    let centroid = null;
    for (const poly of polys) {
      for (let r = 0; r < poly.length; r++) {
        const pts = poly[r].map(([lon, lat]) => project(lon, lat));
        d += "M" + pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L") + "Z";
        if (r === 0) {
          // area + centroid of the outer ring (largest ring gets the label)
          let a = 0, cx = 0, cy = 0;
          for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const cross = pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
            a += cross;
            cx += (pts[j][0] + pts[i][0]) * cross;
            cy += (pts[j][1] + pts[i][1]) * cross;
          }
          const area = Math.abs(a) / 2;
          if (area > bestArea && a !== 0) {
            bestArea = area;
            centroid = [cx / (3 * a), cy / (3 * a)];
          }
        }
      }
    }
    districts.push({
      id: `${name}-${division}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      division,
      d,
      area: bestArea,
      centroid,
      color: colorFor(division),
    });
  }
  return { districts, viewW, viewH, project };
}

/**
 * 2D SVG map of Bangladesh's 64 districts (replaces the Three.js version).
 * Hover highlights, click selects and calls onDistrictSelect({ name, division }).
 */
export default function District3DMap({
  height = 480,
  onDistrictSelect,
  counts = {},
  highlightDistrict,
  markerLat,
  markerLng,
  markerName,
}) {
  const { t, n } = useLanguage();
  const stageRef = useRef(null);
  const tipRef = useRef(null);
  const [geom, setGeom] = useState(null);
  const [status, setStatus] = useState("loading");
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [size, setSize] = useState({ w: 600, h: height });

  // Load the district boundaries once
  useEffect(() => {
    let cancelled = false;
    fetch(GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error("GeoJSON request failed");
        return r.json();
      })
      .then((geo) => {
        if (cancelled) return;
        setGeom(buildGeometry(geo));
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Failed to load district map", err);
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Track the container size (so text/pins stay readable at any size)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && r.width && r.height) setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pre-select the highlighted district
  useEffect(() => {
    if (!geom || !highlightDistrict) return;
    const target = highlightDistrict.trim().toLowerCase();
    const hit = geom.districts.find((x) => x.name.toLowerCase() === target);
    if (hit) setSelectedId(hit.id);
  }, [geom, highlightDistrict]);

  const hasMarker = typeof markerLat === "number" && typeof markerLng === "number";
  const markerPoint = useMemo(
    () => (geom && hasMarker ? geom.project(markerLng, markerLat) : null),
    [geom, hasMarker, markerLat, markerLng]
  );

  // The visible part of the map (zoomed in on the marker / highlighted district)
  const vb = useMemo(() => {
    if (!geom) return { x: 0, y: 0, w: 700, h: 900 };
    const { viewW, viewH } = geom;
    let focus = markerPoint;
    if (!focus && highlightDistrict) {
      const target = highlightDistrict.trim().toLowerCase();
      focus = geom.districts.find((x) => x.name.toLowerCase() === target)?.centroid || null;
    }
    if (!focus) return { x: 0, y: 0, w: viewW, h: viewH };
    const w = viewW / ZOOM;
    const h = viewH / ZOOM;
    const x = Math.min(Math.max(focus[0] - w / 2, 0), viewW - w);
    const y = Math.min(Math.max(focus[1] - h / 2, 0), viewH - h);
    return { x, y, w, h };
  }, [geom, markerPoint, highlightDistrict]);

  // How many screen pixels one SVG unit is. u(px) converts a wanted
  // on-screen size (in px) into SVG units, so text and pins always stay readable.
  const scale = Math.max(Math.min(size.w / vb.w, size.h / vb.h), 0.01);
  const u = (px) => px / scale;

  const zoomed = geom ? vb.w < geom.viewW - 0.5 : false;
  const baseThreshold = size.w < 520 ? 3000 : size.w < 800 ? 2000 : 500;
  const minLabelArea = zoomed ? baseThreshold / 4 : baseThreshold;

  function moveTip(e) {
    const rect = stageRef.current?.getBoundingClientRect();
    const tip = tipRef.current;
    if (!rect || !tip) return;
    let x = e.clientX - rect.left + 16;
    let y = e.clientY - rect.top + 16;
    if (x + 140 > rect.width) x = e.clientX - rect.left - 150;
    if (y + 50 > rect.height) y = e.clientY - rect.top - 60;
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  }

  function handleSelect(dist) {
    setSelectedId(dist.id);
    onDistrictSelect?.({ name: dist.name, division: dist.division });
  }

  const hovered = geom?.districts.find((x) => x.id === hoveredId) || null;
  const outlineIds = [...new Set([selectedId, hoveredId].filter(Boolean))];

  return (
    <div className="district3d" style={{ height }}>
      <div className="district3d__stage" ref={stageRef} style={{ position: "relative", width: "100%", height: "100%" }}>
        {geom && (
          <svg
            viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%", display: "block" }}
            role="img"
            aria-label={t("Bangladesh district map")}
            onPointerLeave={() => setHoveredId(null)}
          >
            {/* Districts (fixed order, so clicks and taps are never disturbed) */}
            {geom.districts.map((dist) => (
              <path
                key={dist.id}
                d={dist.d}
                fillRule="evenodd"
                fill={dist.id === selectedId ? SELECTED_COLOR : dist.color}
                stroke="#ffffff"
                strokeWidth={u(1)}
                strokeLinejoin="round"
                style={{
                  cursor: "pointer",
                  filter: dist.id === hoveredId ? "brightness(1.18)" : "none",
                }}
                onPointerEnter={(e) => {
                  setHoveredId(dist.id);
                  moveTip(e);
                }}
                onPointerMove={moveTip}
                onClick={() => handleSelect(dist)}
              />
            ))}

            {/* Thick white outline on top for hovered / selected districts */}
            {outlineIds.map((id) => {
              const dist = geom.districts.find((x) => x.id === id);
              return dist ? (
                <path
                  key={`o-${id}`}
                  d={dist.d}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={u(2.4)}
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              ) : null;
            })}

            {/* District names (only the larger districts) */}
            {geom.districts.map(
              (dist) =>
                dist.centroid &&
                dist.area >= minLabelArea && (
                  <text
                    key={`l-${dist.id}`}
                    x={dist.centroid[0]}
                    y={dist.centroid[1] + u(24)}
                    textAnchor="middle"
                    fontSize={u(11)}
                    fontWeight="600"
                    fill="#fff"
                    stroke="rgba(0,0,0,.5)"
                    strokeWidth={u(3)}
                    paintOrder="stroke"
                    pointerEvents="none"
                  >
                    {t(dist.name)}
                  </text>
                )
            )}

            {/* Dealer-count pins */}
            {geom.districts.map((dist) => {
              const count = counts[dist.name];
              if (typeof count !== "number" || !dist.centroid) return null;
              return (
                <g
                  key={`c-${dist.id}`}
                  transform={`translate(${dist.centroid[0]},${dist.centroid[1]}) scale(${u(1)})`}
                  pointerEvents="none"
                >
                  <circle r="10" fill="#E2A335" stroke="#fff" strokeWidth="1.5" />
                  <text textAnchor="middle" y="4" fontSize="11" fontWeight="700" fill="#fff">
                    {n(count)}
                  </text>
                </g>
              );
            })}

            {/* Single dealer marker */}
            {markerPoint && (
              <g transform={`translate(${markerPoint[0]},${markerPoint[1]}) scale(${u(1)})`} pointerEvents="none">
                <path
                  d="M0 0C0 0 9 -10 9 -15A9 9 0 1 0 -9 -15C-9 -10 0 0 0 0Z"
                  fill="#E2A335"
                  stroke="#fff"
                  strokeWidth="1.6"
                />
                <circle cy="-15" r="3.5" fill="#fff" />
                {markerName && (
                  <text
                    y="-30"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="#fff"
                    stroke="rgba(0,0,0,.6)"
                    strokeWidth="3"
                    paintOrder="stroke"
                  >
                    {markerName}
                  </text>
                )}
              </g>
            )}
          </svg>
        )}

        <div ref={tipRef} className={"district3d-tooltip" + (hovered ? " show" : "")}>
          {hovered && (
            <>
              <strong>{t(hovered.name)}</strong>
              <span>{t(hovered.division)}</span>
            </>
          )}
        </div>
      </div>

      {status === "loading" && <div className="district3d__status">{t("Loading district map...")}</div>}
      {status === "error" && <div className="district3d__status">{t("Could not load the map. Check your connection.")}</div>}
      {status === "ready" && <div className="district3d__hint">{t("Click a district")}</div>}
    </div>
  );
}
