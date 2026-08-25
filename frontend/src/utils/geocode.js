// Free, no-API-key geocoding via OpenStreetMap's Nominatim service.
// Used by the admin "Locate on map" button: turns a typed address
// (area + district + division) into a lat/lng, so the pin can be set
// automatically instead of always requiring a manual map click.
//
// Note: Nominatim's usage policy asks for light, non-bulk use and a
// descriptive User-Agent — browsers won't let JS set a custom User-Agent,
// so for heavier production traffic consider proxying this through the
// backend instead. For occasional admin-panel lookups, calling it
// directly from the browser (as done here) is fine.
export async function geocodeAddress(query) {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=bd&q=${encodeURIComponent(
    trimmed
  )}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error("Location lookup failed. Please try again.");

  const results = await res.json();
  if (!results.length) return null;

  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}
