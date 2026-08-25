import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import ProductShowcase3D from "../components/ProductShowcase3D";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

const CATEGORIES = [
  {
    title: "Crop Health",
    to: "/products/crop-health",
    key: "crop-health",
    desc: "Bio-fungicides, bio-pesticides and crop protection inputs that keep yield safe from field to harvest.",
  },
  {
    title: "Agro Processing",
    to: "/products/agro-processing",
    key: "agro-processing",
    desc: "Drying, storage and supply-chain infrastructure that protects quality after harvest.",
  },
];

export default function Products() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load products", err));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="What We Supply"
        title="Products"
        description="Two focused wings, each built around a stage of the food-safety journey."
      />
      <section className="section">
        <div className="container grid grid--2">
          {CATEGORIES.map((c) => (
            <Link key={c.to} to={c.to} className="card tile" style={{ display: "block", padding: 32 }}>
              <h2>{t(c.title)}</h2>
              <p>{t(c.desc)}</p>
              <span style={{ color: "var(--canopy-green)", fontWeight: 700 }}>{t("Browse products")} &rarr;</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductShowcase3D products={products} />
    </div>
  );
}
