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

  if (status === "loading") {
    return (
      <section className="section">
        <div className="container">
          <p className="loading-state">{t("Loading products...")}</p>
        </div>
      </section>
    );
  }

  if (status !== "ok") {
    return (
      <section className="section">
        <div className="container">
          <meta name="robots" content="noindex" />
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

  const p = localizeProduct(raw, lang);
  const isBn = lang === "bn";
  const url = `${SITE}/products/${raw.slug || slug}`;
  const cat = CATEGORY[raw.category];

  const title = (isBn && raw.seoTitleBn) || raw.seoTitle || p.name;
  const description =
    (isBn && raw.metaDescriptionBn) || raw.metaDescription || p.shortDescription || p.description || "";
  const keywords = [raw.keywords, raw.keywordsBn].filter(Boolean).join(", ");
  const alt = (isBn && raw.altTextBn?.trim()) || raw.altText?.trim() || p.name;
  // Only a real web link is used for Google (not an embedded data image).
  const imageUrl = raw.image && /^https?:\/\//i.test(raw.image) ? raw.image : null;
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
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
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
