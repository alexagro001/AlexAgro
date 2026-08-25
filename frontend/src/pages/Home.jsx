import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { animate, onScroll, stagger } from "animejs";
import { Link, useNavigate } from "react-router-dom";
import LeafButton from "../components/LeafButton";
import LeafIcon from "../components/LeafIcon";
import BannerSlider from "../components/BannerSlider";
import NewsEventsSection from "../components/NewsEventsSection";
import GrassDivider from "../components/GrassDivider";
import ProductShowcase3D from "../components/ProductShowcase3D";
import LazyOnVisible from "../components/LazyOnVisible";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axios";
import { site } from "../siteConfig";

const District3DMap = lazy(() => import("../components/District3DMap"));

const WINGS = [
  {
    title: "Crop Health",
    to: "/products/crop-health",
    desc: "Bio-based fungicides, pesticides and crop protection inputs formulated for safe food production.",
  },
  {
    title: "Agro Processing",
    to: "/products/agro-processing",
    desc: "Post-harvest infrastructure and processing support that reduces loss from farm to market.",
  },
  {
    title: "Distribution Network",
    to: "/network/dealers",
    desc: "A nationwide web of dealers and sales officers keeping inputs available close to every farm.",
  },
  {
    title: "Farmer Support",
    to: "/about",
    desc: "Field-level advisory and training so farmers get the most out of every input we supply.",
  },
];

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const wingsGridRef = useRef(null);
  const [districtCounts, setDistrictCounts] = useState({});
  const [products, setProducts] = useState([]);
  const [counts, setCounts] = useState({ dealers: 0, distributors: 0, divisions: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [dealerRes, distributorRes, productRes] = await Promise.all([
          api.get("/dealers"),
          api.get("/distributors"),
          api.get("/products"),
        ]);

        setProducts(productRes.data);

        const divisions = new Set([
          ...dealerRes.data.map((d) => d.division),
          ...distributorRes.data.map((d) => d.division),
        ]);

        const dCounts = {};
        [...dealerRes.data, ...distributorRes.data].forEach((d) => {
          if (d.district) dCounts[d.district] = (dCounts[d.district] || 0) + 1;
        });
        setDistrictCounts(dCounts);

        setCounts({
          dealers: dealerRes.data.length,
          distributors: distributorRes.data.length,
          divisions: divisions.size,
        });
      } catch (err) {
        console.error("Failed to load network preview", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!wingsGridRef.current) return undefined;
    const cards = wingsGridRef.current.querySelectorAll(".tile");
    const anim = animate(cards, {
      translateY: [26, 0],
      delay: stagger(90),
      duration: 700,
      easing: "easeOutQuad",
      autoplay: onScroll({
        target: wingsGridRef.current,
        enter: "bottom-=40 top",
        once: true,
      }),
    });
    return () => anim.pause?.();
  }, []);

  return (
    <div>
      <BannerSlider />

      <section className="hero">
        <div className="hero__inner">
          <div>
            <div className="eyebrow hero__eyebrow">{t(site.tagline)}</div>
            <h1 className="hero__title">{t("Restoring organic life to global crop soils.")}</h1>
            <p className="hero__lede">
              {t(site.description)} {t("We deliver safe, science-backed crop-health inputs and agro-processing support through a nationwide network of dealers and sales officers.")}
            </p>
            <div className="hero__actions">
              <LeafButton to="/products/crop-health">{t("Explore Products")}</LeafButton>
              <LeafButton to="/network/dealers" variant="outline">
                {t("Find a Dealer")}
              </LeafButton>
            </div>
          </div>
          <div className="hero__art">
            <img src="/images/leaf-strength-arm.jpg" alt="Strength grown from every leaf" className="hero__art-img" />
          </div>
        </div>
        <div className="hero__field-photo" style={{ backgroundImage: "url(/images/leaves-falling.jpg)" }} />
      </section>

      <ProductShowcase3D products={products} />

      <section className="stat-strip">
        <div className="stat-strip__inner">
          <div>
            <div className="stat-strip__num">{counts.dealers || "—"}</div>
            <div className="stat-strip__label">{t("Active Dealers")}</div>
          </div>
          <div>
            <div className="stat-strip__num">{counts.distributors || "—"}</div>
            <div className="stat-strip__label">{t("Sales Officers")}</div>
          </div>
          <div>
            <div className="stat-strip__num">{counts.divisions || "—"}</div>
            <div className="stat-strip__label">{t("Divisions Covered")}</div>
          </div>
          <div>
            <div className="stat-strip__num">2</div>
            <div className="stat-strip__label">{t("Business Wings")}</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="eyebrow">{t("What We Do")}</div>
          <h2>{t("Two wings, one goal: safe food security")}</h2>
          <div className="grid grid--4" style={{ marginTop: 28 }} ref={wingsGridRef}>
            {WINGS.map((w) => (
              <Link key={w.title} to={w.to} className="card tile" style={{ display: "block" }}>
                <div className="tile__icon">
                  <LeafIcon size={20} />
                </div>
                <h3>{t(w.title)}</h3>
                <p>{t(w.desc)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <GrassDivider style={{ display: "block", width: "100%", height: 28, color: "var(--canopy-green)" }} />

      <NewsEventsSection />

      <section className="section section-tight" style={{ background: "rgba(251, 248, 241, 0.35)" }}>
        <div className="container">
          <div className="eyebrow">{t("Distribution Network")}</div>
          <h2>{t("Present across every division of Bangladesh")}</h2>
          <p style={{ maxWidth: 560 }}>
            {t("Tap a district to see its dealers and sales officers.")}
          </p>
          <LazyOnVisible minHeight={480}>
            <Suspense fallback={<div className="district3d-loading-fallback" style={{ height: 480 }} />}>
              <District3DMap
                height={480}
                counts={districtCounts}
                onDistrictSelect={({ division }) =>
                  navigate(`/network/dealers?division=${encodeURIComponent(division)}`)
                }
              />
            </Suspense>
          </LazyOnVisible>
          <div style={{ textAlign: "center" }}>
            <LeafButton to="/network/dealers" size="sm">
              {t("View Full Dealer List")}
            </LeafButton>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>{t("Have a question about our products or coverage?")}</h2>
          <p style={{ maxWidth: 480, margin: "0 auto 20px" }}>
            {t("Our team responds to every inquiry submitted through the contact form.")}
          </p>
          <LeafButton to="/contact" variant="amber">
            {t("Contact Us")}
          </LeafButton>
        </div>
      </section>
    </div>
  );
}
