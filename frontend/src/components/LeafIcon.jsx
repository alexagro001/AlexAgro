/**
 * A single reusable leaf glyph, used consistently across tile icons,
 * card headings, list bullets, and the admin sidebar — so the same
 * agricultural motif shows up everywhere rather than a different icon
 * style per section.
 */
export default function LeafIcon({ size = 18, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 18C4 14,3 8,10 2 17 8,16 14,10 18Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 17V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
