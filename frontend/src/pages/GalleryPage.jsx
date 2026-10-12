import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Lightbox from "../components/Lightbox";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

export default function GalleryPage({ type }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxItem, setLightboxItem] = useState(null);
  const { t, l } = useLanguage();

  useEffect(() => {
    setLoading(true);
    api
      .get("/gallery", { params: { type } })
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Failed to load gallery", err))
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div>
      <PageHeader
        eyebrow="Gallery"
        title={type === "video" ? "Videos" : "Photo"}
        description={type === "video" ? "Watch stories from the field." : "A look at our work with farmers and dealers."}
      />
      <section className="section">
        <div className="container">
          {loading && <p className="loading-state">{t("Loading gallery...")}</p>}
          {!loading && items.length === 0 && (
            <p className="empty-state">{t("Nothing published here yet — add items from the admin panel.")}</p>
          )}
          <div className="grid grid--3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 300px))" }}>
            {items.map((item) => (
              <div key={item._id} className="card" style={{ overflow: "hidden", maxWidth: 300 }}>
                {item.type === "video" ? (
                  /\.(mp4|webm|ogg|mov)$/i.test(item.url) ? (
                    <div style={{ aspectRatio: "16/9", background: "#000" }}>
                      <video
                        src={item.url}
                        controls
                        style={{ width: "100%", height: "100%" }}
                        poster={item.thumbnail || undefined}
                      />
                    </div>
                  ) : (
                    <div style={{ aspectRatio: "16/9" }}>
                      <iframe
                        src={item.url}
                        title={l(item, "title")}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        allowFullScreen
                      />
                    </div>
                  )
                ) : (
                  <div
                    className="product-card__media gallery-thumb"
                    onClick={() => item.url && setLightboxItem(item)}
                  >
                    {item.url ? (
                      <img src={item.url} alt={l(item, "title")} />
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="9" cy="10" r="1.6" fill="currentColor" />
                        <path d="M3 17l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </div>
                )}
                <div style={{ padding: "14px 16px" }}>
                  <h3 style={{ fontSize: "1rem" }}>{l(item, "title")}</h3>
                  {item.description && (
                    <p style={{ fontSize: "0.85rem", color: "var(--ink-soil-60)", marginTop: 4 }}>
                      {l(item, "description")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxItem && (
        <Lightbox
          image={lightboxItem.url}
          title={l(lightboxItem, "title")}
          description={l(lightboxItem, "description")}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </div>
  );
}
