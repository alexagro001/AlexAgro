import { useEffect, useRef, useState } from "react";
import LeafButton from "./LeafButton";
import Lightbox from "./Lightbox";
import { useLanguage } from "../context/LanguageContext";
import { normalizeLink } from "../utils/links";
import { playClickSound } from "../utils/sound";
import { localizeProduct } from "../utils/localizeProduct";

/**
 * Real product packet photos slowly circling a horizontal oval track,
 * like fish in a tank — they travel across the front, curve around at
 * each end, and come back around behind, in one continuous serial loop
 * with every admin-added product included (no cap, no gaps). Position
 * is computed explicitly every frame with plain ellipse math rather
 * than relying on a CSS feature, so the motion is guaranteed to render
 * the same way everywhere. Click any packet to see it expanded with its
 * full description (image left, text right, both large).
 */
export default function ProductShowcase3D({ products }) {
  const [expanded, setExpanded] = useState(null);
  const { t, lang } = useLanguage();
  const localizedProducts = products.map((p) => localizeProduct(p, lang));

  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const rafRef = useRef(null);
  const sizeRef = useRef({ w: 900, h: 460 });

  const count = localizedProducts.length;
  // One full lap of the tank takes longer the more products there are,
  // floored at a slow minimum so it's never rushed even with just one
  // or two products, and capped so a huge catalog doesn't take forever.
  const lapSeconds = Math.min(Math.max(count * 5, 26), 70);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || count === 0) return undefined;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) sizeRef.current = { w: entry.contentRect.width, h: entry.contentRect.height };
    });
    ro.observe(container);
    sizeRef.current = { w: container.clientWidth, h: container.clientHeight };

    const start = performance.now();

    function frame(now) {
      const elapsed = (now - start) / 1000;
      const { w, h } = sizeRef.current;
      const centerX = w / 2;
      const centerY = h / 2;
      const radiusX = w * 0.43;
      const radiusY = h * 0.36;
      const angularSpeed = (Math.PI * 2) / lapSeconds;

      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const phase = (i / count) * Math.PI * 2;
        const angle = phase + elapsed * angularSpeed;
        const x = centerX + radiusX * Math.cos(angle);
        const y = centerY + radiusY * Math.sin(angle);
        // Items on the "far" side of the loop (behind, going away from
        // the viewer) sit slightly smaller and further back visually,
        // like fish further back in a tank - a simple depth cue.
        const depth = (Math.sin(angle) + 1) / 2; // 0 = front/near, 1 = back/far
        const scale = 1 - depth * 0.28;
        const z = Math.round(100 - depth * 90);
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
        el.style.zIndex = z;
      });

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, lapSeconds]);

  if (products.length === 0) return null;

  return (
    <section className="product-showcase">
      <div className="container">
        <div className="eyebrow" style={{ textAlign: "center" }}>{t("Incorporating modern methods and technology")}</div>
        <h2 style={{ textAlign: "center" }}>{t("Our Products")}</h2>
        <p style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 10px" }}>
          {t("Every product below is managed live from the admin panel.")}
        </p>
      </div>

      <div className="product-orbit" ref={containerRef}>
        {localizedProducts.map((p, i) => (
          <button
            key={p._id}
            type="button"
            ref={(el) => (itemRefs.current[i] = el)}
            className="product-orbit__item"
            onClick={() => {
              playClickSound();
              setExpanded(p);
            }}
          >
            <span className="product-orbit__inner">
              <span className="product-orbit__frame">
                {p.image ? (
                  <img src={p.image} alt={p.name} draggable={false} />
                ) : (
                  <span className="product-orbit__fallback">{p.name}</span>
                )}
              </span>
              <span className="product-orbit__name">{p.name}</span>
            </span>
          </button>
        ))}
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
