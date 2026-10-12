import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { playSwipeSound, playClickSound } from "../utils/sound";
import BeeIcon from "./BeeIcon";
import Lightbox from "./Lightbox";

export default function NewsEventsSection() {
  const [items, setItems] = useState([]);
  const [lightboxItem, setLightboxItem] = useState(null);
  const trackRef = useRef(null);
  const { t, l, formatDate } = useLanguage();

  useEffect(() => {
    api
      .get("/gallery")
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Failed to load news & events", err));
  }, []);

  const scroll = (dir) => {
    playSwipeSound();
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".news-card");
    const step = card ? card.offsetWidth + 20 : 280;
    track.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <>
    <section className="section section-tight">
      <div className="container">
        <div className="eyebrow">{t("News & Events")}</div>
        <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {t("Latest from the field")}
          <BeeIcon size={22} className="leaf-icon--accent" />
        </h2>

        <div className="news-carousel">
          <button
            type="button"
            className="banner-slider__arrow banner-slider__arrow--left news-carousel__arrow"
            onClick={() => scroll(-1)}
            aria-label={t("Scroll news left")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 2L4 8l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="news-carousel__track" ref={trackRef}>
            {items.map((item) => (
              <div key={item._id} className="news-card">
                <div
                  className="news-card__media gallery-thumb"
                  onClick={() => {
                    const hasDisplayableImage = item.type === "video" ? item.thumbnail : item.url;
                    if (hasDisplayableImage) {
                      playClickSound();
                      setLightboxItem(item);
                    }
                  }}
                >
                  {item.type === "video" ? (
                    item.thumbnail ? (
                      <>
                        <img src={item.thumbnail} alt={l(item, "title")} />
                        <span className="news-card__play">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="9" cy="10" r="1.6" fill="currentColor" />
                        <path d="M3 17l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )
                  ) : item.url ? (
                    <img src={item.url} alt={l(item, "title")} />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 21C6 16,5 10,12 3 C19 10,18 16,12 21Z" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                  <span className="news-card__date">
                    {formatDate(item.createdAt, { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="news-card__body">
                  <h3>{l(item, "title")}</h3>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="banner-slider__arrow banner-slider__arrow--right news-carousel__arrow"
            onClick={() => scroll(1)}
            aria-label={t("Scroll news right")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>

      {lightboxItem && (
        <Lightbox
          image={lightboxItem.type === "video" ? lightboxItem.thumbnail : lightboxItem.url}
          title={l(lightboxItem, "title")}
          description={l(lightboxItem, "description")}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </>
  );
}