export default function BeeIcon({ size = 22, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="12" cy="13" rx="4.2" ry="5.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8.2 10.4h7.6M8 13.2h8M8.2 16h7.6" stroke="currentColor" strokeWidth="1.1" opacity="0.7" />
      <path d="M12 8C10 5.5 7 5 5.5 6.5S5.5 11 8 11" stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.85" />
      <path d="M12 8c2-2.5 5-3 6.5-1.5S18.5 11 16 11" stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.85" />
      <circle cx="12" cy="6.4" r="1.6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.6 5.2 9.4 3.8M13.4 5.2l1.2-1.4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
