import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { useLanguage } from "../context/LanguageContext";

const GEOJSON_URL = "/data/bd-districts.geojson";

// Division colors pulled from the site's own palette, so the map reads
// as part of the same brand rather than an unrelated inserted widget.
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
const BORDER_COLOR = 0xffffff;

const EXTRUSION = 0.14;
const HOVER_LIFT = 0.22;
const SELECTED_LIFT = 0.28;

function hexForDivision(name) {
  return DIVISION_COLORS[name] || DIVISION_COLORS[name?.replace(" Division", "")] || DIVISION_COLORS.default;
}

function project(lon, lat, center, scale) {
  return { x: (lon - center.lon) * scale, y: (lat - center.lat) * scale };
}

function boundsOfGeoJSON(gj) {
  const b = { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity };
  for (const f of gj.features) {
    const walk = (coords) => {
      if (typeof coords[0] === "number") {
        const [lon, lat] = coords;
        b.minLon = Math.min(b.minLon, lon);
        b.maxLon = Math.max(b.maxLon, lon);
        b.minLat = Math.min(b.minLat, lat);
        b.maxLat = Math.max(b.maxLat, lat);
      } else {
        coords.forEach(walk);
      }
    };
    walk(f.geometry.coordinates);
  }
  return b;
}

function ringToShape(ring, center, scale) {
  const pts = ring.map(([lon, lat]) => project(lon, lat, center, scale));
  const shape = new THREE.Shape();
  shape.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i].x, pts[i].y);
  shape.closePath();
  return shape;
}

/**
 * A real, interactive 3D map of Bangladesh's 64 districts (actual
 * boundary geometry, not illustrated). Hover lifts a district and
 * highlights it; click selects it and calls onDistrictSelect with
 * { name, division }. Drag to rotate, scroll to zoom (OrbitControls).
 * Fully self-contained — sizes itself to whatever container it's
 * placed in via ResizeObserver, and cleans up all WebGL/DOM resources
 * on unmount.
 */
export default function District3DMap({ height = 480, onDistrictSelect, counts = {}, highlightDistrict }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const { t } = useLanguage();
  const countsRef = useRef(counts);
  countsRef.current = counts;
  const highlightRef = useRef(highlightDistrict);
  highlightRef.current = highlightDistrict;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let width = container.clientWidth || 600;
    let heightPx = container.clientHeight || height;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, width / heightPx, 0.1, 100);
    // Pulled back just enough for a safety margin (verified against the
    // real geometry at desktop/tablet/mobile aspect ratios) - close enough
    // that the map actually fills its frame instead of floating small in
    // the middle, but never so close that it clips past the edges.
    camera.position.set(0, -8.11, 9.71);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, heightPx);
    container.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, heightPx);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.inset = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    container.appendChild(labelRenderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.minPolarAngle = Math.PI * 0.2;
    controls.update();

    scene.add(new THREE.HemisphereLight(0xffffff, 0xcbd9cf, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(5, -5, 9);
    scene.add(key);
    const fillLight = new THREE.DirectionalLight(0x9fe8ff, 1.1);
    fillLight.position.set(-5, 4, 5);
    scene.add(fillLight);

    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const districtMeshes = [];
    const districtGroups = new Map();
    const disposables = [];
    let hovered = null;
    let selected = null;
    let destroyed = false;

    function addPolygonToGroup(poly, feature, group, center, scale) {
      if (!poly?.length || !poly[0]?.length) return;
      const outerShape = ringToShape(poly[0], center, scale);
      for (let h = 1; h < poly.length; h++) {
        const holeRing = poly[h];
        if (!holeRing?.length) continue;
        const hp = holeRing.map(([lon, lat]) => project(lon, lat, center, scale));
        const path = new THREE.Path();
        path.moveTo(hp[0].x, hp[0].y);
        for (let i = 1; i < hp.length; i++) path.lineTo(hp[i].x, hp[i].y);
        path.closePath();
        outerShape.holes.push(path);
      }

      const geo = new THREE.ExtrudeGeometry(outerShape, {
        depth: EXTRUSION,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelSize: 0.01,
        bevelThickness: 0.014,
        curveSegments: 2,
      });
      geo.computeVertexNormals();
      disposables.push(geo);

      const division = feature.properties?.ADM1_EN || "Bangladesh";
      const mat = new THREE.MeshStandardMaterial({ color: hexForDivision(division), roughness: 0.72, metalness: 0.03 });
      disposables.push(mat);

      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { group, baseColor: hexForDivision(division) };
      group.add(mesh);
      districtMeshes.push(mesh);

      const edgesGeo = new THREE.EdgesGeometry(geo, 28);
      const edgesMat = new THREE.LineBasicMaterial({ color: BORDER_COLOR, transparent: true, opacity: 0.8 });
      disposables.push(edgesGeo, edgesMat);
      const edges = new THREE.LineSegments(edgesGeo, edgesMat);
      edges.position.z = 0.008;
      group.add(edges);
    }

    function createCountBadge(group, centroid, count) {
      if (typeof count !== "number") return;
      const el = document.createElement("div");
      el.className = "district3d-pin";
      el.innerHTML = `
        <svg width="16" height="19" viewBox="0 0 16 19" fill="none" aria-hidden="true">
          <path d="M8 18C8 18 15 11.5 15 7A7 7 0 101 7C1 11.5 8 18 8 18Z" fill="#E2A335" stroke="#fff" stroke-width="1.2"/>
          <circle cx="8" cy="7" r="2.6" fill="#fff"/>
        </svg>
        <span class="district3d-pin__count">${count}</span>
      `;
      const obj = new CSS2DObject(el);
      obj.position.set(centroid.x, centroid.y, EXTRUSION + 0.12);
      group.add(obj);
    }

    function createLabel(group, feature, center, scale, minArea) {
      const geom = feature.geometry;
      const rings = [];
      if (geom.type === "Polygon") rings.push(geom.coordinates[0]);
      else if (geom.type === "MultiPolygon") geom.coordinates.forEach((p) => rings.push(p[0]));

      // Find the largest ring (a MultiPolygon district might have small
      // offshore islands as separate rings - label the main landmass).
      let best = null;
      let bestArea = 0;
      let bestCentroid = null;
      for (const ring of rings) {
        const pts = ring.map(([lon, lat]) => project(lon, lat, center, scale));
        let area = 0;
        let sx = 0, sy = 0;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          area += pts[j].x * pts[i].y - pts[i].x * pts[j].y;
          sx += pts[i].x;
          sy += pts[i].y;
        }
        area = Math.abs(area) / 2;
        if (area > bestArea) {
          bestArea = area;
          best = ring;
          bestCentroid = { x: sx / pts.length, y: sy / pts.length };
        }
      }
      if (!best) return;

      // The dealer-count pin always shows (regardless of district size),
      // since counts matter even for small districts - only the text
      // name label is skipped for tiny districts to avoid crowding.
      const districtName = feature.properties?.ADM2_EN || "";
      createCountBadge(group, bestCentroid, countsRef.current[districtName]);

      if (bestArea < minArea) return;
      const el = document.createElement("div");
      el.className = "district3d-label";
      el.textContent = districtName;
      const obj = new CSS2DObject(el);
      obj.position.set(bestCentroid.x, bestCentroid.y - 0.1, EXTRUSION + 0.08);
      group.add(obj);
    }

    function setDistrictState(group, state) {
      const meshes = group.children.filter((x) => x.isMesh);
      for (const m of meshes) {
        // Selected districts still get a color swap (clear feedback for
        // "this is the one you picked"), but hovering no longer changes
        // color at all - only the lift/elevation communicates hover now.
        if (state === "selected") m.material.color.set(SELECTED_COLOR);
        else m.material.color.set(group.userData.baseColor || DIVISION_COLORS.default);
      }
    }

    function setTarget(group, z) {
      if (group) group.userData.targetZ = z;
    }

    async function loadMap() {
      try {
        const res = await fetch(GEOJSON_URL);
        if (!res.ok) throw new Error("GeoJSON request failed");
        const geo = await res.json();
        if (destroyed) return;

        const bounds = boundsOfGeoJSON(geo);
        const lonSpan = bounds.maxLon - bounds.minLon;
        const latSpan = bounds.maxLat - bounds.minLat;
        // Larger than before so the map actually fills its frame instead
        // of floating small in the middle - the camera pullback below still
        // keeps enough margin that it can't clip past the edges.
        const scale = 7 / Math.max(lonSpan, latSpan);
        const center = {
          lon: (bounds.minLon + bounds.maxLon) / 2,
          lat: (bounds.minLat + bounds.maxLat) / 2,
        };
        // Only label the larger ~40% of districts by area - showing all 64
        // at once at the default zoom crowds every name into an unreadable
        // jumble (small, tightly-packed districts especially).
        const MIN_LABEL_AREA = 0.05;

        for (const feature of geo.features) {
          if (!feature.geometry) continue;
          const name = feature.properties?.ADM2_EN || "District";
          const division = feature.properties?.ADM1_EN || "Bangladesh";
          const id = `${name}-${division}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

          const group = new THREE.Group();
          group.userData = { id, name, division, targetZ: 0, currentZ: 0 };
          districtGroups.set(id, group);

          const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
          for (const poly of polygons) addPolygonToGroup(poly, feature, group, center, scale);
          createLabel(group, feature, center, scale, MIN_LABEL_AREA);
          mapGroup.add(group);
        }

        mapGroup.rotation.x = -0.13;

        // Pre-highlight a specific district (e.g. "this dealer's district")
        // without requiring a click - same visual treatment as a click,
        // and it becomes the "selected" one so later clicks/hovers behave
        // correctly relative to it.
        if (highlightRef.current) {
          const target = highlightRef.current.trim().toLowerCase();
          for (const group of districtGroups.values()) {
            if (group.userData.name.toLowerCase() === target) {
              selected = group;
              setDistrictState(group, "selected");
              setTarget(group, SELECTED_LIFT);
              break;
            }
          }
        }

        if (!destroyed) setStatus("ready");
      } catch (err) {
        console.error("Failed to load district map", err);
        if (!destroyed) setStatus("error");
      }
    }

    function getIntersects(clientX, clientY) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(districtMeshes, false);
    }

    const tooltipEl = document.createElement("div");
    tooltipEl.className = "district3d-tooltip";
    container.appendChild(tooltipEl);

    function moveTooltip(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      let x = clientX - rect.left + 16;
      let y = clientY - rect.top + 16;
      if (x + 140 > rect.width) x = clientX - rect.left - 150;
      if (y + 50 > rect.height) y = clientY - rect.top - 60;
      tooltipEl.style.left = `${x}px`;
      tooltipEl.style.top = `${y}px`;
    }

    function handlePointerMove(e) {
      const hit = getIntersects(e.clientX, e.clientY)[0];
      const next = hit?.object?.userData?.group || null;
      if (next !== hovered) {
        if (hovered && hovered !== selected) {
          setTarget(hovered, 0);
          setDistrictState(hovered, "normal");
        }
        hovered = next;
        if (hovered) {
          setTarget(hovered, hovered === selected ? SELECTED_LIFT : HOVER_LIFT);
          tooltipEl.innerHTML = `<strong>${hovered.userData.name}</strong><span>${hovered.userData.division}</span>`;
          tooltipEl.classList.add("show");
          renderer.domElement.style.cursor = "pointer";
        } else {
          tooltipEl.classList.remove("show");
          renderer.domElement.style.cursor = "default";
        }
      } else if (hovered) {
        moveTooltip(e.clientX, e.clientY);
      }
      if (hovered) moveTooltip(e.clientX, e.clientY);
    }

    function handlePointerLeave() {
      if (hovered && hovered !== selected) {
        setTarget(hovered, 0);
        setDistrictState(hovered, "normal");
      }
      hovered = null;
      tooltipEl.classList.remove("show");
      renderer.domElement.style.cursor = "default";
    }

    function handleClick(e) {
      const hit = getIntersects(e.clientX, e.clientY)[0];
      const next = hit?.object?.userData?.group || null;
      if (!next) return;
      if (selected && selected !== next) {
        setTarget(selected, 0);
        setDistrictState(selected, "normal");
      }
      selected = next;
      setDistrictState(selected, "selected");
      setTarget(selected, SELECTED_LIFT);
      onDistrictSelect?.({ name: selected.userData.name, division: selected.userData.division });
    }

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("click", handleClick);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      width = entry.contentRect.width || width;
      heightPx = entry.contentRect.height || heightPx;
      camera.aspect = width / heightPx;
      camera.updateProjectionMatrix();
      renderer.setSize(width, heightPx);
      labelRenderer.setSize(width, heightPx);
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let rafId;
    function loop() {
      rafId = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      const speed = 1 - Math.exp(-dt / 0.09);
      for (const group of districtGroups.values()) {
        const u = group.userData;
        u.currentZ += (u.targetZ - u.currentZ) * speed;
        group.position.z = u.currentZ;
      }
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }

    loadMap();
    loop();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("click", handleClick);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      if (labelRenderer.domElement.parentNode) labelRenderer.domElement.parentNode.removeChild(labelRenderer.domElement);
      if (tooltipEl.parentNode) tooltipEl.parentNode.removeChild(tooltipEl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="district3d" style={{ height }}>
      <div className="district3d__stage" ref={containerRef} />
      {status === "loading" && <div className="district3d__status">{t("Loading district map...")}</div>}
      {status === "error" && <div className="district3d__status">{t("Could not load the map. Check your connection.")}</div>}
      {status === "ready" && (
        <div className="district3d__hint">{t("Drag to rotate · Scroll to zoom · Click a district")}</div>
      )}
    </div>
  );
}