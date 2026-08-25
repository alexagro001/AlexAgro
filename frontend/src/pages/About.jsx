import { useEffect, useRef } from "react";
import { animate, onScroll, stagger } from "animejs";
import PageHeader from "../components/PageHeader";
import LeafIcon from "../components/LeafIcon";
import { site } from "../siteConfig";
import { useLanguage } from "../context/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  const tilesRef = useRef(null);

  useEffect(() => {
    if (!tilesRef.current) return undefined;
    const cards = tilesRef.current.querySelectorAll(".tile");
    const anim = animate(cards, {
      translateY: [26, 0],
      delay: stagger(90),
      duration: 700,
      easing: "easeOutQuad",
      autoplay: onScroll({
        target: tilesRef.current,
        enter: "bottom-=40 top",
        once: true,
      }),
    });
    return () => anim.pause?.();
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Who We Are"
        title="About Us"
        description="Building a safer, more secure food supply — one district at a time."
      />

      <section className="section">
        <div className="container grid grid--2">
          <div>
            <h2>{t("Our story")}</h2>
            <p>{t(site.description)}</p>
            <p>
              {site.legalName} {t("was founded to give farmers dependable access to safe, effective agricultural inputs. What started as a small crop-health supply effort has grown into a nationwide operation spanning two core wings: Crop Health and Agro Processing, backed by a distribution network of dealers and sales officers.")}
            </p>
            <p>
              {t("We work directly with agronomists and field teams to make sure every product we distribute is appropriate for local growing conditions, and every dealer in our network is equipped to advise farmers on proper use.")}
            </p>
          </div>
          <div>
            <h2>{t("What guides us")}</h2>
            <p>
              {t("Our approach rests on three commitments: safety of the food supply, fairness to the farmers and dealers we work with, and steady investment in the infrastructure — drying, storage, cold chain — that prevents post-harvest loss.")}
            </p>
            <p>
              {t("This site reflects that same commitment: every dealer, sales officer and product listed here is managed centrally and reaches farmers, dealers and job seekers the moment it's published.")}
            </p>
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ textAlign: "center" }}>
        <img
          src="/images/floating-island-1.jpg"
          alt="A steady foundation for sustainable growth"
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            objectFit: "cover",
            margin: "0 auto",
            boxShadow: "0 16px 26px rgba(31,92,61,0.25), 0 0 0 8px rgba(255,255,255,0.6)",
          }}
        />
        <p style={{ maxWidth: 420, margin: "14px auto 0", fontWeight: 600, color: "var(--canopy-green-dark)" }}>
          {t("A steady foundation, built to grow.")}
        </p>
      </section>

      <section className="section section-tight" style={{ background: "rgba(251, 248, 241, 0.35)" }}>
        <div className="container grid grid--3" ref={tilesRef}>
          <div className="card tile">
            <div className="tile__icon"><LeafIcon size={20} /></div>
            <h3>{t("Our Mission")}</h3>
            <p>{t("Deliver safe, science-backed agro-inputs to every corner of the country.")}</p>
          </div>
          <div className="card tile">
            <div className="tile__icon"><LeafIcon size={20} /></div>
            <h3>{t("Our Network")}</h3>
            <p>{t("A living, admin-managed map of dealers and sales officers, always up to date.")}</p>
          </div>
          <div className="card tile">
            <div className="tile__icon"><LeafIcon size={20} /></div>
            <h3>{t("Our Promise")}</h3>
            <p>{t("Every inquiry reaches a real person — contact messages route directly to our team.")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
