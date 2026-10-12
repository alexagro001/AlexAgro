import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { animate, splitText, stagger } from "animejs";
import { useNavigate } from "react-router-dom";
import LeafButton from "../components/LeafButton";
import BannerSlider from "../components/BannerSlider";
import NewsEventsSection from "../components/NewsEventsSection";
import GrassDivider from "../components/GrassDivider";
import HomeHero from "../components/HomeHero";
import HomeWhatWeDo from "../components/HomeWhatWeDo";
import HomeProducts from "../components/HomeProducts";
import LazyOnVisible from "../components/LazyOnVisible";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axios";

const District3DMap = lazy(() => import("../components/District3DMap"));

export default function Home() {
  const { t, n } = useLanguage();
  const navigate = useNavigate();
  const taglineRef = useRef(null);
  const [districtCounts, setDistrictCounts] = useState({});
  const [products, setProducts] = useState([]);
  const [counts, setCounts] = useState({ dealers: 0, distributors: 0, divisions: 0 });

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load product preview", err));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [dealerRes, distributorRes] = await Promise.all([
          api.get("/dealers"),
          api.get("/distributors"),
        ]);

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
    if (!taglineRef.current) return undefined;
    // Skip the 3D wave entirely when the user has reduced motion enabled
    // or on coarse-pointer devices (touchscreens), where a looping
    // rotateY+z transform would only cost GPU compositing layers.
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (prefersReduced || isTouch) return undefined;

    const split = splitText(taglineRef.current, { words: { class: "split-word" } });
    const anim = animate(split.words, {
      rotateY: [0, 34, 0],
      z: [0, 42, 0],
      translateY: [0, -8, 0],
      duration: 2400,
      delay: stagger(200),
      loop: true,
      easing: "easeInOutSine",
    });
    return () => {
      anim.pause?.();
      split.revert();
    };
  }, []);

  return (
    <div>
      <BannerSlider />

      <HomeHero taglineRef={taglineRef} />

      <HomeProducts products={products} />

      <section className="stat-strip">
        <div className="stat-strip__inner">
          <div>
            <div className="stat-strip__num">{counts.dealers ? n(counts.dealers) : "—"}</div>
            <div className="stat-strip__label">{t("Active Dealers")}</div>
          </div>
          <div>
            <div className="stat-strip__num">{counts.distributors ? n(counts.distributors) : "—"}</div>
            <div className="stat-strip__label">{t("Sales Officers")}</div>
          </div>
          <div>
            <div className="stat-strip__num">{counts.divisions ? n(counts.divisions) : "—"}</div>
            <div className="stat-strip__label">{t("Divisions Covered")}</div>
          </div>
          <div>
            <div className="stat-strip__num">{n(2)}</div>
            <div className="stat-strip__label">{t("Business Wings")}</div>
          </div>
        </div>
      </section>

      <HomeWhatWeDo />

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