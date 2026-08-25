import { useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function Lightbox({ image, title, description, actionHref, actionLabel, sideBySide, onClose }) {
  const { t } = useLanguage();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!image) return null;

  if (sideBySide) {
    return (
      <div className="lightbox" onClick={onClose}>
        <button type="button" className="lightbox__back" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M8.5 2.5L3 8l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("Back")}
        </button>
        <div className="lightbox__split" onClick={(e) => e.stopPropagation()}>
          <div className="lightbox__split-image">
            <img src={image} alt={title || ""} />
          </div>
          <div className="lightbox__split-text">
            {title && <h2 className="lightbox__split-title">{title}</h2>}
            {description && <p className="lightbox__split-desc">{description}</p>}
            {actionHref && (
              <a className="leaf-btn" href={actionHref} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                {actionLabel || t("View Details")}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lightbox" onClick={onClose}>
      <button type="button" className="lightbox__back" onClick={onClose}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M8.5 2.5L3 8l5.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("Back")}
      </button>
      <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <img src={image} alt={title || ""} />
        {title && <div className="lightbox__caption">{title}</div>}
        {description && <p className="lightbox__desc">{description}</p>}
        {actionHref && (
          <a className="leaf-btn leaf-btn--sm" href={actionHref} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            {actionLabel || t("View Details")}
          </a>
        )}
      </div>
    </div>
  );
}
