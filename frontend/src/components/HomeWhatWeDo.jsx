import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LeafIcon from "./LeafIcon";
import { useLanguage } from "../context/LanguageContext";

const WINGS = [
  {
    title: "Crop Health",
    to: "/products/crop-health",
    desc: "Bio-based fungicides, pesticides and crop protection inputs formulated for safe food production.",
    image: "/images/photos/crop-field.jpg",
    focus: "50% 55%",
  },
  {
    title: "Agro Processing",
    to: "/products/agro-processing",
    desc: "Post-harvest infrastructure and processing support that reduces loss from farm to market.",
    image: "/images/photos/grain-harvest.jpg",
    focus: "60% 55%",
  },
  {
    title: "Distribution Network",
    to: "/network/dealers",
    desc: "A nationwide web of dealers and sales officers keeping inputs available close to every farm.",
    image: "/images/photos/delivery-truck.jpg",
    focus: "45% 60%",
  },
  {
    title: "Farmer Support",
    to: "/about",
    desc: "Field-level advisory and training so farmers get the most out of every input we supply.",
    image: "/images/photos/farmer-harvest.jpg",
    focus: "55% 38%",
  },
];

export default function HomeWhatWeDo() {
  const sectionRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    if (!("IntersectionObserver" in window)) {
      section.classList.add("is-in");
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("is-in");
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="wwd" ref={sectionRef} aria-labelledby="wwd-title">
      <svg className="wwd__leaf wwd__leaf--tr" viewBox="0 0 180 180" aria-hidden="true">
        <path d="M16 150C24 55 94 14 164 20c-3 76-45 138-148 130Z" fill="#dce9c9" />
        <path d="M18 150 150 30M63 108l-3-42m41 3-2 39m-4 35 38 3" fill="none" stroke="#f7f9f2" strokeWidth="4" />
      </svg>
      <svg className="wwd__leaf wwd__leaf--bl" viewBox="0 0 180 180" aria-hidden="true">
        <path d="M16 150C24 55 94 14 164 20c-3 76-45 138-148 130Z" fill="#dce9c9" />
        <path d="M18 150 150 30M63 108l-3-42m41 3-2 39m-4 35 38 3" fill="none" stroke="#f7f9f2" strokeWidth="4" />
      </svg>

      <div className="wwd__head">
        <LeafIcon className="wwd__crest" size={36} />
        <p className="wwd__eyebrow">
          <span className="wwd__line" />
          {t("What We Do")}
          <span className="wwd__line" />
        </p>
        <h2 className="wwd__title" id="wwd-title">
          {t("Two wings, one goal:")}
          <span className="wwd__title-em">{t("safe food security")}</span>
        </h2>
        <p className="wwd__sub">
          {t("From healthy crops to a stronger food supply, we support farmers at every step.")}
        </p>
      </div>

      <ul className="wwd__grid">
        {WINGS.map((wing, index) => (
          <li className="wwd__item" key={wing.title} style={{ "--i": index }}>
            <Link to={wing.to} className="wwd__card">
              <span className="wwd__icon">
                <LeafIcon size={30} />
              </span>
              <span className="wwd__name">{t(wing.title)}</span>
              <span className="wwd__rule" />
              <span className="wwd__text">
                <span className="wwd__desc">{t(wing.desc)}</span>
              </span>
              <span className="wwd__go" aria-hidden="true">
                <span className="wwd__go-label">{t("Learn more")}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="wwd__photo" aria-hidden="true">
                <span className="wwd__shape" />
                <span className="wwd__frame">
                  <img src={wing.image} alt="" loading="lazy" className="wwd__img" style={{ objectPosition: wing.focus }} />
                </span>
                <svg className="wwd__edge" viewBox="0 0 400 160" preserveAspectRatio="none">
                  <path d="M-10 67C70 65 95 23 176 31s125 76 234 52" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
