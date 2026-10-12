import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const PANELS = [
  {
    caption: "Healthy roots, richer soil",
    copy: ["Healthy seedlings, stronger roots—", "For healthier crops - "],
    art: "roots",
    photo: "/images/photos/tomato.jpg",
    focus: "50% 40%",
  },
  {
    caption: "Farmers who trust the harvest",
    copy: ["Fertile soil, thriving crops—", "Trusted by farmers - "],
    art: "farmers",
    photo: "/images/photos/chili-farmer.jpg",
    focus: "40% 25%",
  },
  {
    caption: "Bumper yield, carried home",
    copy: ["Golden grain, a full harvest—", "Your partner for better yields - "],
    art: "harvest",
    photo: "/images/photos/eggplant.jpg",
    focus: "50% 40%",
  },
];

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
              <strong>{t("Alex Agro")}</strong>
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
                <img src={panel.photo} alt="" style={{ objectPosition: panel.focus }} />
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
