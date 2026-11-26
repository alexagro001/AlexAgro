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
          // area + centroid of the outer ring (largest ring wins)
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

  // Per-division data: area-weighted middle point + its districts.
  // (The label spot is picked later, so it can avoid the dealer-count pins.)
  const byDiv = new Map();
  for (const dist of districts) {
    if (!dist.centroid) continue;
    const e = byDiv.get(dist.division) || { sx: 0, sy: 0, w: 0, items: [] };
    e.sx += dist.centroid[0] * dist.area;
    e.sy += dist.centroid[1] * dist.area;
    e.w += dist.area;
    e.items.push(dist);
    byDiv.set(dist.division, e);
  }
  const divisions = [];
  for (const [name, e] of byDiv) {
    if (!e.w) continue;
    divisions.push({ name, cx: e.sx / e.w, cy: e.sy / e.w, items: e.items });
  }

  return { districts, divisions, viewW, viewH, project };
}

/**
 * 2D SVG map of Bangladesh's 64 districts (replaces the Three.js version).
 * Only the 8 division names are drawn on the map; district names show on
 * hover (tooltip) and for the selected district. Click / tap selects a
 * district and calls onDistrictSelect({ name, division }).
 */
export default function District3DMap({
  height = 480,
  onDistrictSelect,
  counts,
  highlightDistrict,
  markerLat,
  markerLng,
  markerName,
}) {
  const { t, n } = useLanguage();
  const safeCounts = counts || {};
  const stageRef = useRef(null);
  const tipRef = useRef(null);
  const [geom, setGeom] = useState(null);
  const [status, setStatus] = useState("loading");
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [size, setSize] = useState({ w: 600, h: typeof height === "number" ? height : 480 });

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
  // on-screen size (in px) into SVG units, so text and pins stay readable.
  const scale = Math.max(Math.min(size.w / vb.w, size.h / vb.h), 0.01);
  const u = (px) => px / scale;

  // Division name positions: inside the division, nearest to its middle,
  // and (when possible) in a district that has no dealer-count pin.
  const divisionLabels = geom
    ? geom.divisions.map((dv) => {
        const free = dv.items.filter((it) => typeof safeCounts[it.name] !== "number");
        const pool = free.length ? free : dv.items;
        let best = pool[0];
        let bestDist = Infinity;
        for (const it of pool) {
          const dd = (it.centroid[0] - dv.cx) ** 2 + (it.centroid[1] - dv.cy) ** 2;
          if (dd < bestDist) {
            bestDist = dd;
            best = it;
          }
        }
        return { name: dv.name, pos: best.centroid };
      })
    : [];

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
  const selected = geom?.districts.find((x) => x.id === selectedId) || null;
  const outlineIds = [...new Set([selectedId, hoveredId].filter(Boolean))];
  const divFont = size.w < 520 ? 12 : 14;

  return (
    <div className="district3d" style={{ height }}>
      <div className="district3d__stage" ref={stageRef} style={{ position: "relative", width: "100%", height: "100%" }}>
        {geom && (
          <svg
            viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              WebkitTapHighlightColor: "transparent",
              WebkitUserSelect: "none",
              userSelect: "none",
              outline: "none",
            }}
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
                strokeWidth={u(0.8)}
                strokeLinejoin="round"
                style={{ cursor: "pointer" }}
                onPointerEnter={(e) => {
                  setHoveredId(dist.id);
                  moveTip(e);
                }}
                onPointerMove={moveTip}
                onClick={() => handleSelect(dist)}
              />
            ))}

            {/* Highlight on top: light veil + thick white outline for hovered / selected */}
            {outlineIds.map((id) => {
              const dist = geom.districts.find((x) => x.id === id);
              return dist ? (
                <path
                  key={`o-${id}`}
                  d={dist.d}
                  fillRule="evenodd"
                  fill={id === hoveredId && id !== selectedId ? "rgba(255,255,255,0.22)" : "none"}
                  stroke="#ffffff"
                  strokeWidth={u(2.4)}
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              ) : null;
            })}

            {/* The 8 division names */}
            {divisionLabels.map((dv) => (
              <text
                key={`dv-${dv.name}`}
                x={dv.pos[0]}
                y={dv.pos[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={u(divFont)}
                fontWeight="800"
                fill="#fff"
                stroke="rgba(0,0,0,.6)"
                strokeWidth={u(3.5)}
                paintOrder="stroke"
                pointerEvents="none"
              >
                {t(dv.name)}
              </text>
            ))}

            {/* Name of the selected district only */}
            {selected && selected.centroid && (
              <text
                x={selected.centroid[0]}
                y={selected.centroid[1] + u(22)}
                textAnchor="middle"
                fontSize={u(11)}
                fontWeight="600"
                fill="#fff"
                stroke="rgba(0,0,0,.55)"
                strokeWidth={u(3)}
                paintOrder="stroke"
                pointerEvents="none"
              >
                {t(selected.name)}
              </text>
            )}

            {/* Dealer-count pins */}
            {geom.districts.map((dist) => {
              const count = safeCounts[dist.name];
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
