import { useEffect, useRef, useState } from "react";
import LeafButton from "./LeafButton";
import Lightbox from "./Lightbox";
import { useLanguage } from "../context/LanguageContext";
import { normalizeLink } from "../utils/links";
import { playClickSound } from "../utils/sound";
import { localizeProduct } from "../utils/localizeProduct";

// Pixels per second - slow, steady, one direction, never fast.
const SPEED = 45;

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
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0 && x <= -halfWidth) {
          x += halfWidth;
        }
        track.style.transform = `translateX(${x}px)`;
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; lastTime = performance.now(); };
    wrap.addEventListener("mouseenter", onEnter);
    wrap.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      wrap.removeEventListener("mouseenter", onEnter);
      wrap.removeEventListener("mouseleave", onLeave);
    };
  }, [localizedProducts.length]);

  if (products.length === 0) return null;

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
          description={expanded.shortDescription || expanded.description}
          actionHref={expanded.detailsLink ? normalizeLink(expanded.detailsLink) : null}
          sideBySide
          onClose={() => setExpanded(null)}
        />
      )}
    </section>
  );
}