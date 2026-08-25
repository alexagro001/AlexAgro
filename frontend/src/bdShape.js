// Real Bangladesh national boundary, projected from actual geographic
// coordinates (equirectangular projection) into a 480x594 SVG viewBox.
// Division marker positions are computed the same way, from each
// division's real lat/lng, so they land in the geographically correct
// spot relative to the country's actual silhouette — not hand-placed.

export const BD_SHAPE_VIEWBOX = "0 0 480 593.86";

export const BD_SHAPE_PATH =
  "M 460.0,442.45 L 458.04,511.23 L 424.57,496.7 L 430.83,573.86 L 403.44,523.87 L 397.91,475.02 L 379.66,428.86 L 339.59,373.04 L 251.26,369.21 L 259.98,408.74 L 229.87,462.1 L 189.07,442.65 L 175.12,460.11 L 147.97,449.65 L 110.87,441.06 L 95.94,362.1 L 62.71,289.98 L 79.03,232.2 L 20.0,206.51 L 41.28,171.56 L 101.24,135.83 L 32.02,85.06 L 65.9,20.0 L 141.85,61.44 L 187.63,66.17 L 196.09,132.85 L 287.34,146.0 L 376.27,144.58 L 431.56,160.95 L 387.35,242.11 L 344.45,247.65 L 314.84,302.22 L 367.34,351.92 L 383.02,290.64 L 409.49,290.33 L 460.0,442.45 Z";

// Percent-based (x, y) positions within the viewBox for each division,
// derived from real coordinates — used to place markers on the shape.
export const BD_DIVISION_POSITIONS = {
  Dhaka: { x: 50.7, y: 45.9 },
  Chattogram: { x: 78.1, y: 69.4 },
  Rajshahi: { x: 14.6, y: 36.8 },
  Khulna: { x: 33.3, y: 61.5 },
  Barishal: { x: 49.5, y: 63.8 },
  Sylhet: { x: 79.8, y: 28.4 },
  Rangpur: { x: 28.0, y: 14.7 },
  Mymensingh: { x: 50.8, y: 30.8 },
};
