import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const PANELS = [
  {
    caption: "Healthy roots, richer soil",
    copy: ["Healthy seedlings, stronger roots—", "For healthier crops - "],
    art: "roots",
  },
  {
    caption: "Farmers who trust the harvest",
    copy: ["Fertile soil, thriving crops—", "Trusted by farmers - "],
    art: "farmers",
  },
  {
    caption: "Bumper yield, carried home",
    copy: ["Golden grain, a full harvest—", "Your partner for better yields - "],
    art: "harvest",
  },
];

function PanelArtwork({ type }) {
  if (type === "roots") {
    return (
      <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="home-root-sky" x2="0" y2="1">
            <stop stopColor="#f4e2b0" />
            <stop offset=".55" stopColor="#a8c47a" />
            <stop offset="1" stopColor="#5f8a3a" />
          </linearGradient>
        </defs>
        <rect width="200" height="280" fill="url(#home-root-sky)" />
        <path d="M0 196Q60 186 110 194T200 188V280H0z" fill="#3b2416" />
        <g stroke="#e9d5a9" fill="none" strokeLinecap="round" strokeWidth="2">
          <path d="M100 198C98 225 80 245 55 265M100 198C100 230 100 250 102 275M100 198C104 225 125 245 150 265M100 205C85 215 70 220 45 222M100 205C120 215 135 218 160 220M98 215C90 235 88 252 80 275M102 215C110 235 118 250 128 275" />
        </g>
        <path d="M100 200C98 150 102 100 100 58" stroke="#3f7d2a" strokeWidth="4" fill="none" />
        <g fill="#4f9a34">
          <ellipse cx="70" cy="122" rx="36" ry="14" transform="rotate(-28 70 122)" />
          <ellipse cx="132" cy="112" rx="36" ry="14" transform="rotate(26 132 112)" fill="#5cab3d" />
          <ellipse cx="76" cy="160" rx="32" ry="12" transform="rotate(-22 76 160)" fill="#3f8a2b" />
          <ellipse cx="128" cy="150" rx="30" ry="12" transform="rotate(22 128 150)" />
          <ellipse cx="102" cy="70" rx="16" ry="30" transform="rotate(8 102 70)" fill="#63b345" />
        </g>
      </svg>
    );
  }

  if (type === "farmers") {
    return (
      <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="home-farm-sky" x2="0" y2="1">
            <stop stopColor="#8dbfdc" />
            <stop offset=".5" stopColor="#d7e6d6" />
          </linearGradient>
          <linearGradient id="home-farm-field" x2="0" y2="1">
            <stop stopColor="#cfa93a" />
            <stop offset="1" stopColor="#b9891c" />
          </linearGradient>
          <pattern id="home-farm-crops" width="9" height="16" patternUnits="userSpaceOnUse">
            <path d="M4.5 16V3M4.5 7L1 3.5M4.5 7L8 3.5M4.5 11L1.5 8M4.5 11L7.5 8" stroke="#f1d46a" fill="none" strokeWidth="1.1" />
          </pattern>
        </defs>
        <rect width="200" height="280" fill="url(#home-farm-sky)" />
        <path d="M0 130Q50 118 100 128T200 124V280H0z" fill="url(#home-farm-field)" />
        <rect y="130" width="200" height="150" fill="url(#home-farm-crops)" opacity=".85" />
        <circle cx="80" cy="120" r="9" fill="#a9724d" />
        <rect x="66" y="129" width="28" height="60" rx="10" fill="#7ea7c6" />
        <path d="M92 135L108 96" stroke="#7ea7c6" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="112" cy="88" rx="14" ry="10" fill="#e2bf58" />
        <circle cx="132" cy="140" r="8" fill="#a9724d" />
        <rect x="119" y="148" width="26" height="55" rx="10" fill="#d9b8a8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="home-harvest-sky" x2="0" y2="1">
          <stop stopColor="#7c9a4a" />
          <stop offset="1" stopColor="#2e5a26" />
        </linearGradient>
        <pattern id="home-harvest-grain" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-65)">
          <path d="M0 5H10" stroke="#ecd08a" strokeWidth="1.2" />
          <path d="M0 8H10" stroke="#9c7434" strokeWidth=".8" />
        </pattern>
      </defs>
      <rect width="200" height="280" fill="url(#home-harvest-sky)" />
      <rect y="235" width="200" height="45" fill="#8a9a3c" opacity=".8" />
      <rect x="82" y="120" width="52" height="125" rx="20" fill="#d3b8a8" />
      <path d="M84 200H134" stroke="#a47a68" strokeWidth="3" />
      <ellipse cx="108" cy="90" rx="82" ry="52" fill="#c49a52" />
      <ellipse cx="108" cy="90" rx="82" ry="52" fill="url(#home-harvest-grain)" />
      <ellipse cx="80" cy="60" rx="30" ry="14" fill="#e7cb85" opacity=".6" />
    </svg>
  );
}

function BenefitIcon({ type }) {
  if (type === "soil") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#eaf5e4" stroke="#4caf50" strokeWidth="1.4" />
        <path d="M6 17v-3M10 17v-5M14 17v-7M18 17V8" stroke="#2f7a3a" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 10c3 0 5-2 6-5 0 4 2 4 6 3" fill="none" stroke="#4caf50" strokeWidth="1.2" />
      </svg>
    );
  }
  if (type === "yield") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#2f7a3a" />
        <path d="M12 17c0-4 1-6 5-7-.5 4-2 6-5 7zM12 17c-2-1-3-3-3-5 2 0 3 2 3 5z" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="19.5" rx="9" ry="3.5" fill="#6b4226" />
      <path d="M12 19V9" stroke="#2f7a3a" strokeWidth="1.6" />
      <path d="M12 12C6 12 5 7 5 7c5-1 7 2 7 5z" fill="#4caf50" />
      <path d="M12 10c0-4 3-6 7-6 0 4-3 7-7 6z" fill="#2f7a3a" />
    </svg>
  );
}

export default function HomeHero({ taglineRef }) {
  const [active, setActive] = useState(-1);
  const { t } = useLanguage();
  const subtitles =
    active < 0
      ? [t("From soil care to harvest—"), t("Always by the farmer's side - ")]
      : PANELS[active].copy.map(t);

  return (
    <div className="home-hero-wrap">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__band" />
        <div className="home-hero__copy">
          <p className="home-hero__eyebrow" ref={taglineRef}>
            {t("NATURAL • SAFE • EFFECTIVE")}
          </p>
          <h1 id="home-hero-title" className="home-hero__title">
            {t("Better Soil,")}
            <br />
            {t("Stronger Crops,")}
            <br />
            <span>
              <u>{t("Better")}</u> {t("Harvest.")}
            </span>
          </h1>
          <div className="home-hero__subtitles" aria-live="polite">
            <p key={active} className="home-hero__subtitle">
              {subtitles[0]}
              <br />
              {subtitles[1]}
              <strong>Alex Agro</strong>
            </p>
          </div>
          <div className="home-hero__benefits" aria-label={t("Our benefits")}>
            {[
              { title: "Better", detail: "Crop Health", type: "crop" },
              { title: "Improved", detail: "Soil Fertility", type: "soil" },
              { title: "Higher", detail: "Yield", type: "yield" },
            ].map((benefit, index) => (
              <div
                key={benefit.detail}
                className={`home-hero__benefit${active === index ? " is-active" : ""}`}
                tabIndex={0}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(-1)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(-1)}
              >
                <span className="home-hero__benefit-icon">
                  <BenefitIcon type={benefit.type} />
                </span>
                <strong>{t(benefit.title)}</strong>
                <small>{t(benefit.detail)}</small>
              </div>
            ))}
          </div>
          <div className="home-hero__actions">
            <Link className="home-hero__button home-hero__button--primary" to="/products/crop-health">
              {t("Explore Products")}
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="home-hero__button" to="/network/dealers">
              {t("Find a Dealer")}
              <span aria-hidden="true">◎</span>
            </Link>
          </div>
        </div>
        <div
          className={`home-hero__panels${active > -1 ? " has-active" : ""}`}
          onMouseLeave={() => setActive(-1)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setActive(-1);
          }}
        >
          {PANELS.map((panel, index) => (
            <button
              key={panel.art}
              type="button"
              className={`home-hero__panel${active === index ? " is-active" : ""}`}
              aria-label={t(panel.caption)}
              aria-pressed={active === index}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") setActive((active + 1) % PANELS.length);
                if (event.key === "ArrowLeft") setActive((active - 1 + PANELS.length) % PANELS.length);
              }}
            >
              <span className="home-hero__art">
                <PanelArtwork type={panel.art} />
              </span>
              <span className="home-hero__glow" />
              <span className="home-hero__caption">{t(panel.caption)}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
