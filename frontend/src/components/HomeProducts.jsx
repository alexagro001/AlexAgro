import { useState } from "react";
import { Link } from "react-router-dom";
import LeafIcon from "./LeafIcon";
import { localizeProduct } from "../utils/localizeProduct";
import { normalizeLink } from "../utils/links";
import { useLanguage } from "../context/LanguageContext";

const PRODUCT_FALLBACKS = [
  ["Gibberellic Acid", "Supports flowering, fruit set, and uniform crop growth.", "gibberellic-acid.png"],
  ["Agricultural Gypsum", "A soil conditioner with calcium and sulphur.", "gypsum.png"],
  ["S-Boron", "Water-soluble boron for flowering and fruit setting.", "s-boron.png"],
  ["Humic Acid", "Supports root development and nutrient absorption.", "humic-acid.png"],
  ["Zinc Sulphate", "Zinc nutrition for healthy leaves and crop growth.", "zinc-mono.png"],
  ["Boric Acid", "Boron micronutrient for flower and fruit development.", "boric-acid.png"],
  ["Chelated Zinc", "Fast-absorbing zinc micronutrient for crops.", "chelated-zinc.png"],
].map(([name, shortDescription, image], index) => ({
  _id: `preview-product-${index}`,
  name,
  category: "crop-health",
  shortDescription,
  description: shortDescription,
  image: `/images/products/${image}`,
}));

function Arrow({ previous = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={previous ? "is-reversed" : ""}>
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomeProducts({ products }) {
  const { lang, t } = useLanguage();
  const items = (products.length ? products : PRODUCT_FALLBACKS).map((product) => localizeProduct(product, lang));
  const [activeIndex, setActiveIndex] = useState(0);
  const index = Math.min(activeIndex, items.length - 1);
  const active = items[index];
  const target = normalizeLink(
    active.detailsLink || (active.category === "agro-processing" ? "/products/agro-processing" : "/products/crop-health")
  );
  const next = (delta) => setActiveIndex((index + delta + items.length) % items.length);

  return (
    <section className="op" aria-labelledby="op-title">
      <header className="op__head">
        <p className="op__eyebrow">{t("Incorporating modern methods and technology")}</p>
        <h2 className="op__title" id="op-title">{t("Quality solutions for every field.")}</h2>
        <p className="op__sub">{t("Explore trusted products created to support healthier crops and better harvests.")}</p>
      </header>
      <div className="op__stage">
        <button className="op__arrow op__arrow--prev" type="button" aria-label={t("Previous product")} onClick={() => next(-1)}>
          <Arrow previous />
        </button>
        <article className="op__card" key={active._id || index}>
          <div className="op__media">
            <span className="op__badge"><LeafIcon size={17} />{t(active.category === "agro-processing" ? "Agro Processing" : "Crop Health")}</span>
            {active.image ? <img src={active.image} alt={active.name} loading="lazy" /> : <LeafIcon size={72} />}
          </div>
          <div className="op__info">
            <h3 className="op__name">{active.name}</h3>
            {active.shortDescription && <p className="op__tagline">{active.shortDescription}</p>}
            <span className="op__rule" />
            {active.description && <p className="op__description">{active.description}</p>}
            {target.startsWith("/") ? (
              <Link className="op__cta" to={target}>{t("Explore product")} <Arrow /></Link>
            ) : (
              <a className="op__cta" href={target} target="_blank" rel="noreferrer">{t("Explore product")} <Arrow /></a>
            )}
          </div>
        </article>
        <button className="op__arrow op__arrow--next" type="button" aria-label={t("Next product")} onClick={() => next(1)}>
          <Arrow />
        </button>
      </div>
      <div className="op__thumbs" aria-label={t("Choose a product")}>
        {items.map((item, itemIndex) => (
          <button
            type="button"
            key={item._id || `${item.name}-${itemIndex}`}
            className={`op__thumb${itemIndex === index ? " is-active" : ""}`}
            aria-pressed={itemIndex === index}
            onClick={() => setActiveIndex(itemIndex)}
          >
            {item.image ? <img src={item.image} alt="" loading="lazy" /> : <LeafIcon size={40} />}
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
