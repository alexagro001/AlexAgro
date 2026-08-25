import { Link } from "react-router-dom";
import { playClickSound } from "../utils/sound";

function LeafGlyph() {
  return (
    <svg className="leaf-btn__icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 14C1 9 3 3 14 2 13 10 8 14 2 14Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Polymorphic leaf-shaped button. Renders a <Link> when `to` is given,
 * an <a> when `href` is given, otherwise a <button>.
 * variant: "green" (default) | "amber" | "outline"
 */
export default function LeafButton({
  to,
  href,
  variant = "green",
  size,
  children,
  className = "",
  onClick,
  ...rest
}) {
  const variantClass = variant === "amber" ? "leaf-btn--amber" : variant === "outline" ? "leaf-btn--outline" : "";
  const sizeClass = size === "sm" ? "leaf-btn--sm" : "";
  const classes = `leaf-btn ${variantClass} ${sizeClass} ${className}`.trim();

  const handleClick = (e) => {
    playClickSound();
    if (onClick) onClick(e);
  };

  if (to) {
    return (
      <Link to={to} className={classes} onClick={handleClick} {...rest}>
        <LeafGlyph />
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={handleClick} {...rest}>
        <LeafGlyph />
        {children}
      </a>
    );
  }

  return (
    <button className={classes} onClick={handleClick} {...rest}>
      <LeafGlyph />
      {children}
    </button>
  );
}
