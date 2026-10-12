import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function PageHeader({ eyebrow, title, description }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <header className="page-header">
      <div className="container">
        <button
          type="button"
          className="page-header__back"
          onClick={() => navigate(-1)}
          aria-label={t("Go back")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M8.5 2.5L3 8l5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("Back")}
        </button>
        {eyebrow && <div className="breadcrumb">{t(eyebrow)}</div>}
        <h1>{t(title)}</h1>
        {description && <p>{t(description)}</p>}
      </div>

      <svg className="page-header__vine" viewBox="0 0 1200 26" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 10 Q 60 22 120 8 T 240 9 Q 300 22 360 8 T 480 9 Q 540 22 600 8 T 720 9 Q 780 22 840 8 T 960 9 Q 1020 22 1080 8 T 1200 9"
          stroke="var(--sprout-lime)"
          strokeWidth="1.4"
          fill="none"
          opacity="0.6"
        />
        {[80, 260, 440, 620, 800, 980, 1150].map((x, i) => (
          <path
            key={x}
            d={`M${x} 12 C ${x - 8} 6, ${x - 2} 2, ${x + 6} 4 C ${x} 8, ${x - 2} 11, ${x} 12Z`}
            fill="var(--sprout-lime)"
            opacity={i % 2 === 0 ? 0.8 : 0.5}
          />
        ))}
      </svg>
    </header>
  );
}
