import { useEffect, useRef, useState } from "react";
import LeafButton from "./LeafButton";
import Lightbox from "./Lightbox";
import { useLanguage } from "../context/LanguageContext";
import { normalizeLink } from "../utils/links";
import { playClickSound } from "../utils/sound";
import { localizeProduct } from "../utils/localizeProduct";

// Pixels per second - slow, steady, one direction, never fast.
const SPEED = 45;

/**
 * Real product packet photos scrolling continuously in one direction,
 * never stopping on their own (only pauses on hover) - once the set
 * finishes passing, the same set loops in seamlessly behind it and
 * keeps going, forever. Works the same no matter how many products
 * admin adds. Click any packet to see it expanded with its full
 * description (image left, text right, both large) - both the short
 * tagline and the full description show, not just one or the other.
 */
export default function ProductShowcase3D({ products }) {
  const [expanded, setExpanded] = useState(null);
  const { t, lang } = useLanguage();
  const localizedProducts = products.map((p) => localizeProduct(p, lang));

  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap || localizedProducts.length === 0) return undefined;

    let x = 0;
    let paused = false;
    let lastTime = performance.now();
    let rafId;

    function frame(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (!paused) {
        x -= SPEED * dt;
        // The track holds two back-to-back copies of the product list,
        // so once we've scrolled past exactly one copy's width, snapping
        // back by that same width puts us in a visually identical spot -
        // the loop point is invisible and the motion never stops.
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0 && x <= -halfWidth) {
          x += halfWidth;
        }
        track.style.transform = `translateX(${x}px)`;
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
      lastTime = performance.now();
    };
    // Mouse pause (desktop). On touch devices we also pause on the
    // first touch so users can tap a product without the marquee
    // immediately scrolling the target out of view.
    const onTouchStart = () => {
      paused = true;
    };
    const onTouchEnd = () => {
      paused = false;
      lastTime = performance.now();
    };
    wrap.addEventListener("mouseenter", onEnter);
    wrap.addEventListener("mouseleave", onLeave);
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      wrap.removeEventListener("mouseenter", onEnter);
      wrap.removeEventListener("mouseleave", onLeave);
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchend", onTouchEnd);
    };
  }, [localizedProducts.length]);

  if (products.length === 0) return null;

  // Two back-to-back copies so the wrap-around point is seamless.
  const trackItems = [...localizedProducts, ...localizedProducts];

  return (
    <section className="product-showcase">
      <div className="container">
        <div className="eyebrow" style={{ textAlign: "center" }}>{t("Incorporating modern methods and technology")}</div>
        <h2 style={{ textAlign: "center" }}>{t("Our Products")}</h2>
        <p style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 10px" }}>
          {t("Every product below is managed live from the admin panel.")}
        </p>
      </div>

      <div className="product-marquee" ref={wrapRef}>
        <div className="product-marquee__track" ref={trackRef}>
          {trackItems.map((p, i) => (
            <button
              key={`${p._id}-${i}`}
              type="button"
              className="product-marquee__item"
              onClick={() => {
                playClickSound();
                setExpanded(p);
              }}
            >
              <span className="product-marquee__frame">
                {p.image ? (
                  <img src={p.image} alt={p.name} draggable={false} />
                ) : (
                  <span className="product-marquee__fallback">{p.name}</span>
                )}
              </span>
              <span className="product-marquee__name">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="product-showcase__cta">
        <LeafButton to="/products" size="sm">
          {t("View Details")}
        </LeafButton>
      </div>

      {expanded && (
        <Lightbox
          image={expanded.image}
          title={expanded.name}
          tagline={expanded.shortDescription}
          description={expanded.description}
          actionHref={expanded.detailsLink ? normalizeLink(expanded.detailsLink) : null}
          sideBySide
          onClose={() => setExpanded(null)}
        />
      )}
    </section>
  );
}