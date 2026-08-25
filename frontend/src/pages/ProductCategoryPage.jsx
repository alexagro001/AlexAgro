import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import ProductCarousel from "../components/ProductCarousel";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

const COPY = {
  "crop-health": {
    title: "Crop Health",
    description: "Bio-based inputs that protect yield while keeping food production safe.",
  },
  "agro-processing": {
    title: "Agro Processing",
    description: "Infrastructure and services that reduce post-harvest loss along the supply chain.",
  },
};

export default function ProductCategoryPage({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const copy = COPY[category];
  const { t } = useLanguage();

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { category } })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load products", err))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div>
      <PageHeader eyebrow="Products" title={copy.title} description={copy.description} />
      <section className="section">
        <div className="container">
          {loading && <p className="loading-state">{t("Loading products...")}</p>}
          {!loading && products.length === 0 && (
            <p className="empty-state">
              {t("No products published yet in this category. Add some from the admin panel.")}
            </p>
          )}
          {!loading && products.length > 0 && (
            <ProductCarousel products={products} categoryLabel={t(copy.title)} />
          )}
        </div>
      </section>
    </div>
  );
}
