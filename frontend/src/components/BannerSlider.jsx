import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { playSwipeSound } from "../utils/sound";
import { useLanguage } from "../context/LanguageContext";
import { normalizeLink } from "../utils/links";

const AUTO_ADVANCE_MS = 5000;
const CACHE_KEY = "alexagro_banners";

function sortBanners(items) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// The last banner list, so repeat visits paint instantly while the API (maybe cold) answers.
function readCachedBanners() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || [];
  } catch {
    return [];
  }
}

function cacheBanners(list) {
  // Inline base64 images are megabytes each; too big to keep in localStorage.
  if (list.some((b) => b.image?.startsWith("data:"))) return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch {
    // storage full or blocked: skip the cache, the live list still renders
  }
}

/* ---- Text colour that follows the slide photo ---------------------------
   Looks at the photo area where the text sits (bottom-left), then picks a
   light shade of that colour on dark photos, or a deep shade on light
   photos, and nudges it until it is easy to read. Any problem returns null
   and the text keeps its normal cream colour. */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function luminance(rgb) {
  const c = rgb.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contrastRatio(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function pickColor(h, s, l, bg, makeDarker, minRatio) {
  let lightness = l;
  let rgb = hslToRgb(h, s, lightness);
  for (let i = 0; i < 25 && contrastRatio(rgb, bg) < minRatio; i += 1) {
    lightness = makeDarker ? Math.max(lightness - 0.03, 0.05) : Math.min(lightness + 0.03, 0.97);
    rgb = hslToRgb(h, s, lightness);
  }
  return `rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`;
}

function readTextColors(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const W = 48;
        const H = 30;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, W, H);
        const x1 = Math.round(W * 0.5);
        const y0 = Math.round(H * 0.6);
        const data = ctx.getImageData(0, y0, x1, H - y0).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count += 1;
        }
        if (!count) {
          resolve(null);
          return;
        }
        // The dark overlay on the slide makes the bottom about 30% darker.
        const bg = [(r / count) * 0.7, (g / count) * 0.7, (b / count) * 0.7];
        const [h, s0] = rgbToHsl(bg[0], bg[1], bg[2]);
        const light = luminance(bg) > 0.4;
        if (!light && s0 < 0.12) {
          resolve(null);
          return;
        }
        const s = Math.min(Math.max(s0, 0.35), 0.8);
        if (light) {
          resolve({
            title: pickColor(h, s, 0.2, bg, true, 4.5),
            sub: pickColor(h, s * 0.8, 0.26, bg, true, 4.5),
            shadow: "none",
          });
        } else {
          resolve({
            title: pickColor(h, s, 0.86, bg, false, 4.5),
            sub: pickColor(h, s * 0.6, 0.9, bg, false, 4.5),
            shadow: undefined,
          });
        }
      } catch {
        // image from another site that blocks reading: keep the normal colour
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function SlideLink({ link, children }) {
  const target = link ? normalizeLink(link) : "";
  if (!target || target === "#") return <div className="banner-slide__hit">{children}</div>;
  if (target.startsWith("/")) {
    return (
      <Link to={target} className="banner-slide__hit">
        {children}
      </Link>
    );
  }
  return (
    <a href={target} target="_blank" rel="noreferrer" className="banner-slide__hit">
      {children}
    </a>
  );
}

export default function BannerSlider() {
  const [banners, setBanners] = useState(readCachedBanners);
  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [index, setIndex] = useState(0);
  // Slides whose image/video is mounted: the current one and the next, so later
  // slides don't compete with the first image for bandwidth on page load.
  const [seen, setSeen] = useState(() => new Set([0]));
  const [textColors, setTextColors] = useState({});
  const askedRef = useRef(new Set());
  const timerRef = useRef(null);
  const { t, n, l } = useLanguage();

  useEffect(() => {
    if (banners.length === 0) return;
    const next = (index + 1) % banners.length;
    setSeen((s) => (s.has(index) && s.has(next) ? s : new Set(s).add(index).add(next)));
  }, [index, banners.length]);

  // Work out the text colour for each slide photo once it is mounted.
  useEffect(() => {
    banners.forEach((b, i) => {
      if (!seen.has(i) || !b.image) return;
      if (/\.(mp4|webm|ogg|mov)$/i.test(b.image)) return;
      const key = `${b._id}|${b.image.slice(0, 200)}`;
      if (askedRef.current.has(key)) return;
      askedRef.current.add(key);
      readTextColors(b.image).then((res) => {
        setTextColors((prev) => ({ ...prev, [b._id]: res || false }));
      });
    });
  }, [banners, seen]);

  useEffect(() => {
    const refreshBanners = async () => {
      try {
        const res = await api.get("/banners", { params: { active: "true" }, timeout: 20000 });
        const ordered = sortBanners(res.data);
        setBanners(ordered);
        cacheBanners(ordered);
        setIndex((current) => Math.min(current, Math.max(ordered.length - 1, 0)));
      } catch (err) {
        console.error("Failed to refresh homepage banners", err);
      }
    };

    window.addEventListener("focus", refreshBanners);
    return () => window.removeEventListener("focus", refreshBanners);
  }, []);

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
        const res = await api.get("/banners", { params: { active: "true" }, timeout: 20000 });
        if (!cancelled) {
          const ordered = sortBanners(res.data);
          setBanners(ordered);
          cacheBanners(ordered);
          setIndex((current) => Math.min(current, Math.max(ordered.length - 1, 0)));
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

  if (loading && banners.length === 0) {
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
        const show = seen.has(i);
        const tc = textColors[b._id] || null;
        return (
          <div
            key={b._id}
            className={`banner-slide ${i === index ? "is-active" : ""}`}
            aria-hidden={i !== index}
          >
            <SlideLink link={b.link}>
              <div
                className="banner-slide__backdrop"
                style={show && !isVideo ? { backgroundImage: `url(${b.image})` } : undefined}
              >
                {show && isVideo && <video src={b.image} autoPlay muted loop playsInline />}
              </div>
              {show &&
                (isVideo ? (
                  <video className="banner-slide__img" src={b.image} autoPlay muted loop playsInline />
                ) : (
                  <img
                    src={b.image}
                    alt={l(b, "title") || `${t("Homepage banner")} ${n(i + 1)}`}
                    className="banner-slide__img"
                    fetchPriority={i === 0 ? "high" : "low"}
                    decoding="async"
                  />
                ))}
              <div className="banner-slide__scrim" />
              {(b.title || b.subtitle) && (
                <div className="banner-slide__copy">
                  {b.title && (
                    <h2
                      style={
                        tc ? { color: tc.title, textShadow: tc.shadow, transition: "color 0.5s ease" } : undefined
                      }
                    >
                      {l(b, "title")}
                    </h2>
                  )}
                  {b.subtitle && (
                    <p
                      style={
                        tc ? { color: tc.sub, textShadow: tc.shadow, transition: "color 0.5s ease" } : undefined
                      }
                    >
                      {l(b, "subtitle")}
                    </p>
                  )}
                </div>
              )}
            </SlideLink>
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button className="banner-slider__arrow banner-slider__arrow--left" onClick={prev} aria-label={t("Previous slide")}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 2L4 8l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="banner-slider__arrow banner-slider__arrow--right" onClick={next} aria-label={t("Next slide")}>
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
                aria-label={`${t("Go to slide")} ${n(i + 1)}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
