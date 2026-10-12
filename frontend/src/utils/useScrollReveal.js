import { useEffect } from "react";

// Blocks that animate in as they scroll into view. Parents are matched
// before their children (document order), and anything inside an already
// revealed block is skipped, so a card animates once — not card + heading.
const TARGETS = [
  "main h1", "main h2", "main h3", "main .eyebrow", "main .breadcrumb", "main p",
  "main .grid > *", "main .card", "main form .field", "main form button",
  "main .leaf-btn", "main .index-row", "main .gallery-grid__item",
  "main .stat-strip__inner > *", "main img", "main iframe", "main video",
  "main .wwd__head > *", "main .op__head > *", "main .op__stage", "main .op__thumbs",
  "main .news-carousel", "main .district3d", "main .product-carousel-wrap",
  "main .product-marquee", "main .bd-shape",
  ".footer__inner > *", ".footer__bottom",
].join(",");

// Areas that already run their own entrance/carousel/3D animations.
const SKIP = [
  ".banner-slider", ".home-hero", ".wwd__grid", ".leaflet-container", ".lightbox",
  ".search-panel", ".product-carousel", ".news-carousel__track", ".op__card",
  "[data-sr-skip]",
].join(",");

// Picks the entrance effect for an element (see styles/reveal.css).
function effectFor(el, siblingIndex) {
  if (el.matches("img, video, iframe")) return "reveal";
  if (el.matches("h1, h2, .eyebrow, .breadcrumb, .wwd__head > *, .op__head > *")) return "rise";
  if (el.matches(".stat-strip__inner > *")) return "pop";
  if (el.matches(".index-row")) return "left";
  if (el.matches(".grid > *, .footer__inner > *")) return siblingIndex % 2 ? "right" : "left";
  if (el.matches(".card, .op__stage, .news-carousel, .district3d, .product-carousel-wrap, .product-marquee, .bd-shape"))
    return "zoom";
  return "fade";
}

export default function useScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.sr = "in";
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0 }
    );

    // Elements this effect run is watching. Tracked per run (not via the
    // data attribute alone) so a re-run — e.g. React StrictMode's double
    // effect in development — re-observes anything still pending.
    const watched = new WeakSet();

    const scan = () => {
      const groups = new Map();
      document.querySelectorAll(TARGETS).forEach((el) => {
        if (watched.has(el) || el.dataset.sr === "in") return;
        if (!el.dataset.sr) {
          if (el.closest(SKIP) || el.parentElement?.closest("[data-sr]")) return;
          if (getComputedStyle(el).animationName !== "none") return;
          // Stagger siblings that are revealed together (grid cards, form fields).
          const i = groups.get(el.parentElement) || 0;
          groups.set(el.parentElement, i + 1);
          el.dataset.sr = "pending";
          el.dataset.srFx = effectFor(el, i);
          el.style.setProperty("--sr-delay", `${Math.min(i, 6) * 90}ms`);
        }
        watched.add(el);
        observer.observe(el);
      });
    };

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };
    scan();
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);
}
