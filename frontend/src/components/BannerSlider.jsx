import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { playSwipeSound } from "../utils/sound";
import { useLanguage } from "../context/LanguageContext";

const AUTO_ADVANCE_MS = 5000;

function SlideLink({ link, children }) {
  if (!link) return <div className="banner-slide__hit">{children}</div>;
  if (link.startsWith("/")) {
    return (
      <Link to={link} className="banner-slide__hit">
        {children}
      </Link>
    );
  }
  return (
    <a href={link} target="_blank" rel="noreferrer" className="banner-slide__hit">
      {children}
    </a>
  );
}

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    let cancelled = false;

    // If a free-tier backend host has spun down from inactivity, the very
    // first request can take 30-60s to wake it back up. That's not a
    // failure to retry away from - it's a slow-but-successful request -
    // so this just lets the user know what's happening instead of the
    // page silently looking stuck.
    const slowTimer = setTimeout(() => {
      if (!cancelled) setSlowLoad(true);
    }, 4000);

    async function loadWithRetry(attempt = 1) {
      try {
        const res = await api.get("/banners", { timeout: 20000 });
        if (!cancelled) {
          setBanners(res.data);
          setLoading(false);
        }
      } catch (err) {
        // Genuine transient failures (network hiccup, backend still
        // finishing startup) get retried with a growing delay for a while
        // - long enough to cover a slow cold start - before giving up.
        if (attempt < 6 && !cancelled) {
          setTimeout(() => loadWithRetry(attempt + 1), Math.min(attempt * 2000, 8000));
        } else if (!cancelled) {
          console.error("Failed to load banners", err);
          setLoading(false);
        }
      }
    }

    loadWithRetry();
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, []);

  useEffect(() => {
    if (banners.length < 2) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  const goTo = (i, manual = false) => {
    if (manual) playSwipeSound();
    setIndex(i);
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length > 1) {
      timerRef.current = setInterval(() => {
        setIndex((cur) => (cur + 1) % banners.length);
      }, AUTO_ADVANCE_MS);
    }
  };

  const prev = () => goTo((index - 1 + banners.length) % banners.length, true);
  const next = () => goTo((index + 1) % banners.length, true);

  if (loading) {
    return (
      <div className="banner-slider banner-slider--skeleton" aria-hidden="true">
        <div className="banner-slider__shimmer" />
        {slowLoad && <div className="banner-slider__wake-note">{t("Waking up the server, just a moment...")}</div>}
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="banner-slider">
      {banners.map((b, i) => {
        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(b.image);
        return (
          <div key={b._id} className={`banner-slide ${i === index ? "is-active" : ""}`}>
            <SlideLink link={b.link}>
              <div
                className="banner-slide__backdrop"
                style={!isVideo ? { backgroundImage: `url(${b.image})` } : undefined}
              >
                {isVideo && <video src={b.image} autoPlay muted loop playsInline />}
              </div>
              {isVideo ? (
                <video className="banner-slide__img" src={b.image} autoPlay muted loop playsInline />
              ) : (
                <img src={b.image} alt={b.title || ""} className="banner-slide__img" />
              )}
              <div className="banner-slide__scrim" />
              {(b.title || b.subtitle) && (
                <div className="banner-slide__copy">
                  {b.title && <h2>{b.title}</h2>}
                  {b.subtitle && <p>{b.subtitle}</p>}
                </div>
              )}
            </SlideLink>
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button className="banner-slider__arrow banner-slider__arrow--left" onClick={prev} aria-label="Previous slide">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 2L4 8l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="banner-slider__arrow banner-slider__arrow--right" onClick={next} aria-label="Next slide">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="banner-slider__dots">
            {banners.map((b, i) => (
              <button
                key={b._id}
                className={`banner-slider__dot ${i === index ? "is-active" : ""}`}
                onClick={() => goTo(i, true)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
