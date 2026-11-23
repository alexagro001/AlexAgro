import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { localizeProduct } from "../utils/localizeProduct";

const SITE = "https://www.alexagro.com.bd";

const CATEGORY = {
  "crop-health": { label: "Crop Health", path: "/products/crop-health" },
  "agro-processing": { label: "Agro Processing", path: "/products/agro-processing" },
};

// Updates the tags that already exist in index.html (title, description,
// canonical...) instead of adding duplicates, and restores them when the
// visitor leaves this page.
function useSeo({ title, description, keywords, canonical, ogImage, noindex }) {
  useEffect(() => {
    const head = document.head;
    const undo = [];

    const prevTitle = document.title;
    if (title) document.title = title;
    undo.push(() => {
      document.title = prevTitle;
    });

    const setTag = (tagName, matchAttr, matchValue, valueAttr, value) => {
      if (!value) return;
      let el = head.querySelector(`${tagName}[${matchAttr}="${matchValue}"]`);
      let created = false;
      if (!el) {
        el = document.createElement(tagName);
        el.setAttribute(matchAttr, matchValue);
        head.appendChild(el);
        created = true;
      }
      const prev = el.getAttribute(valueAttr);
      el.setAttribute(valueAttr, value);
      undo.push(() => {
        if (created) el.remove();
        else if (prev === null) el.removeAttribute(valueAttr);
        else el.setAttribute(valueAttr, prev);
      });
    };

    setTag("meta", "name", "description", "content", description);
    setTag("meta", "name", "keywords", "content", keywords);
    setTag("link", "rel", "canonical", "href", canonical);
    setTag("meta", "property", "og:title", "content", title);
    setTag("meta", "property", "og:description", "content", description);
    setTag("meta", "property", "og:url", "content", canonical);
    setTag("meta", "property", "og:image", "content", ogImage);
    if (noindex) setTag("meta", "name", "robots", "content", "noindex");

    return () => {
      undo.reverse().forEach((fn) => fn());
    };
  }, [title, description, keywords, canonical, ogImage, noindex]);
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, lang } = useLanguage();
  const [raw, setRaw] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .get(`/products/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (cancelled) return;
        if (res.data && res.data.isActive !== false) {
          setRaw(res.data);
          setStatus("ok");
        } else {
          setStatus("missing");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err.response?.status === 404 ? "missing" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const ok = status === "ok";
  const isBn = lang === "bn";
  const p = ok ? localizeProduct(raw, lang) : null;
  const url = ok ? `${SITE}/products/${raw.slug || slug}` : undefined;
  const cat = ok ? CATEGORY[raw.category] : undefined;

  const title = ok ? (isBn && raw.seoTitleBn) || raw.seoTitle || p.name : undefined;
  const description = ok
    ? (isBn && raw.metaDescriptionBn) || raw.metaDescription || p.shortDescription || p.description || ""
    : undefined;
  const keywords = ok ? [raw.keywords, raw.keywordsBn].filter(Boolean).join(", ") : undefined;
  // Only a real web link is used for Google (not an embedded data image).
  const imageUrl = ok && raw.image && /^https?:\/\//i.test(raw.image) ? raw.image : undefined;

  useSeo({
    title,
    description,
    keywords,
    canonical: url,
    ogImage: imageUrl,
    noindex: status === "missing" || status === "error",
  });

  if (status === "loading") {
    return (
      <section className="section">
        <div className="container">
          <p className="loading-state">{t("Loading products...")}</p>
        </div>
      </section>
    );
  }

  if (!ok) {
    return (
      <section className="section">
        <div className="container">
          <p className="empty-state">
            {status === "missing" ? t("Product not found.") : t("Failed to load the product. Please try again.")}
          </p>
          <p>
            <Link to="/products">{t("Back to Products")}</Link>
          </p>
        </div>
      </section>
    );
  }

  const alt = (isBn && raw.altTextBn?.trim()) || raw.altText?.trim() || p.name;
  const otherName = isBn ? raw.name : raw.nameBn;

  const productSchema = {
    "@type": "Product",
    name: p.name,
    description,
    url,
    brand: { "@type": "Brand", name: raw.brand || "Alex Agro" },
  };
  if (otherName && otherName !== p.name) productSchema.alternateName = otherName;
  if (imageUrl) productSchema.image = imageUrl;
  if (raw.sku) productSchema.sku = raw.sku;

  const crumbs = [
    { name: "Home", item: `${SITE}/` },
    { name: "Products", item: `${SITE}/products` },
  ];
  if (cat) crumbs.push({ name: cat.label, item: `${SITE}${cat.path}` });
  crumbs.push({ name: p.name, item: url });

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [productSchema, breadcrumbSchema],
  }).replace(/</g, "\\u003c");

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <PageHeader
        eyebrow={cat ? t(cat.label) : t("Products")}
        title={p.name}
        description={p.shortDescription || ""}
      />
      <section className="section">
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ marginBottom: "1rem" }}>
            <Link to="/">{t("Home")}</Link> / <Link to="/products">{t("Products")}</Link>
            {cat && (
              <>
                {" "}/ <Link to={cat.path}>{t(cat.label)}</Link>
              </>
            )}{" "}
            / <span>{p.name}</span>
          </nav>
          {raw.image && (
            <img
              src={raw.image}
              alt={alt}
              style={{ maxWidth: "100%", height: "auto", maxHeight: 420, display: "block", margin: "0 auto 1.5rem" }}
            />
          )}
          {p.description && <p style={{ whiteSpace: "pre-line" }}>{p.description}</p>}
          <p>
            <Link to={cat ? cat.path : "/products"}>{t("Back to Products")}</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
