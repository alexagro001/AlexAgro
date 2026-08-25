import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../context/LanguageContext";

export default function DistributionNetwork() {
  const { t } = useLanguage();
  return (
    <div>
      <PageHeader
        eyebrow="Nationwide Coverage"
        title="Distribution Network"
        description="We reach farmers through two networks: local dealers and territory sales officers."
      />
      <section className="section">
        <div className="container grid grid--2">
          <Link to="/network/dealers" className="card tile" style={{ display: "block", padding: 32 }}>
            <h2>{t("Dealer List")}</h2>
            <p>{t("Find the nearest retail point stocking our crop-health and agro-processing inputs.")}</p>
            <span style={{ color: "var(--canopy-green)", fontWeight: 700 }}>{t("View dealers on the map")} &rarr;</span>
          </Link>
          <Link to="/network/sales-officers" className="card tile" style={{ display: "block", padding: 32 }}>
            <h2>{t("Sales Officer")}</h2>
            <p>{t("Reach the territory sales officer responsible for your district directly.")}</p>
            <span style={{ color: "var(--canopy-green)", fontWeight: 700 }}>{t("View sales officers")} &rarr;</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
