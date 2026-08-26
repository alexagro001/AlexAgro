import { useEffect, useRef, useState } from "react";
import { normalizeLink } from "../utils/links";
import { useLanguage } from "../context/LanguageContext";
import { playSwipeSound, playClickSound } from "../utils/sound";
import { extractDominantColor } from "../utils/colorExtract";
import { localizeProduct } from "../utils/localizeProduct";
import Lightbox from "./Lightbox";

const AUTO_ADVANCE_MS = 4000;

export default function ProductCarousel({ products, categoryLabel }) {
  const [index, setIndex] = useState(0);
  const [ambientColor, setAmbientColor] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const timerRef = useRef(null);
  const { t, lang } = useLanguage();
  const localizedProducts = products.map((p) => localizeProduct(p, lang));

  useEffect(() => {
    setIndex(0);
  }, [products]);

  useEffect(() => {
    if (products.length < 2) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % products.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [products.length]);

  // Every time the active product changes, pull the real dominant color
  // out of its own photo and use it to tint the glow behind the
  // carousel — and, via a CSS variable on <html>, a soft accent on the
  // navbar too. Resets to neutral when this page is left.
  useEffect(() => {
    let cancelled = false;
    const activeImage = products[index]?.image;

    extractDominantColor(activeImage).then((color) => {
      if (cancelled) return;
      setAmbientColor(color);
      if (color) {
        document.documentElement.style.setProperty(
          "--product-ambient-color",
          `${color.r}, ${color.g}, ${color.b}`
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [index, products]);

  useEffect(() => {
    // Clear the navbar accent once this carousel is no longer on screen.
    return () => {
      document.documentElement.style.removeProperty("--product-ambient-color");
    };
  }, []);

  const goTo = (i, manual = false) => {
    if (manual) playSwipeSound();
    setIndex(i);
    if (timerRef.current) clearInterval(timerRef.current);
    if (products.length > 1) {
      timerRef.current = setInterval(() => {
        setIndex((cur) => (cur + 1) % products.length);
      }, AUTO_ADVANCE_MS);
    }
  };

  if (products.length === 0) return null;

  const glowStyle = ambientColor
    ? { "--carousel-glow": `${ambientColor.r}, ${ambientColor.g}, ${ambientColor.b}` }
    : undefined;

  return (
    <div className="product-carousel-wrap" style={glowStyle}>
      <div className="product-carousel-wrap__glow" />
      <div className="product-carousel product-carousel--dark">
      <div className="product-carousel__track">
        {localizedProducts.map((p, i) => (
          <div key={p._id} className={`product-carousel__slide product-carousel__slide--centered ${i === index ? "is-active" : ""}`}>
            <div
              className="product-carousel__circle product-carousel__circle--zoomable"
              onClick={() => p.image && (playClickSound(), setExpanded(p))}
            >
              {p.image ? (
                <img src={p.image} alt={p.name} />
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21C6 16,5 10,12 3 C19 10,18 16,12 21Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </div>
            <div className="product-carousel__copy product-carousel__copy--centered">
              <div className="product-card__tag">{categoryLabel}</div>
              <h3>{p.name}</h3>
              <p>{p.shortDescription || p.description}</p>
              <button
                type="button"
                className="our-products__btn"
                onClick={() => {
                  playClickSound();
                  setExpanded(p);
                }}
              >
                {t("View Details")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length > 1 && (
        <>
          <button
            className="banner-slider__arrow banner-slider__arrow--left"
            onClick={() => goTo((index - 1 + products.length) % products.length, true)}
            aria-label="Previous product"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 2L4 8l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="banner-slider__arrow banner-slider__arrow--right"
            onClick={() => goTo((index + 1) % products.length, true)}
            aria-label="Next product"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="product-carousel__dots">
            {products.map((p, i) => (
              <button
                key={p._id}
                className={`banner-slider__dot ${i === index ? "is-active" : ""}`}
                onClick={() => goTo(i, true)}
                aria-label={`Show ${p.name}`}
              />
            ))}
          </div>
        </>
      )}
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
    </div>
  );
}