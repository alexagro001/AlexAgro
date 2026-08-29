import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import LeafButton from "../components/LeafButton";
import LeafIcon from "../components/LeafIcon";
import LazyOnVisible from "../components/LazyOnVisible";
import api from "../api/axios";
import { normalizeLink } from "../utils/links";
import { useLanguage } from "../context/LanguageContext";

const District3DMap = lazy(() => import("../components/District3DMap"));

const CONFIG = {
  dealer: {
    endpoint: "/dealers",
    listPath: "/network/dealers",
    listLabel: "Dealer List",
    metaFields: (d) => [d.area, d.district, d.division].filter(Boolean).join(", "),
  },
  distributor: {
    endpoint: "/distributors",
    listPath: "/network/sales-officers",
    listLabel: "Sales Officer",
    metaFields: (d) => [d.designation, d.territory, d.division].filter(Boolean).join(", "),
  },
};

export default function NetworkDetailPage({ kind }) {
  const { id } = useParams();
  const cfg = CONFIG[kind];
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [districtCounts, setDistrictCounts] = useState({});

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get(`${cfg.endpoint}/${id}`)
      .then((res) => setItem(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [kind, id]);

  useEffect(() => {
    (async () => {
      try {
        const [dealerRes, distributorRes] = await Promise.all([
          api.get("/dealers"),
          api.get("/distributors"),
        ]);
        const counts = {};
        [...dealerRes.data, ...distributorRes.data].forEach((d) => {
          if (d.district) counts[d.district] = (counts[d.district] || 0) + 1;
        });
        setDistrictCounts(counts);
      } catch (err) {
        console.error("Failed to load district counts", err);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader eyebrow="Distribution Network" title="Loading..." />
        <p className="loading-state">{t("Fetching details...")}</p>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div>
        <PageHeader eyebrow="Distribution Network" title="Not found" />
        <div className="section">
          <div className="container" style={{ textAlign: "center" }}>
            <p>{t("This entry may have been removed or is no longer visible.")}</p>
            <LeafButton to={cfg.listPath} size="sm">
              {t("Back to")} {t(cfg.listLabel)}
            </LeafButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Distribution Network" title={item.name} description={cfg.metaFields(item)} />

      <section className="section">
        <div className="container grid grid--2">
          <div className="card" style={{ padding: 28 }}>
            <div className="tile__icon" style={{ marginBottom: 12 }}>
              <LeafIcon size={20} />
            </div>
            {item.photo && (
              <img
                src={item.photo}
                alt={item.name}
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  objectFit: "cover",
                  margin: "0 auto 16px",
                  display: "block",
                  boxShadow: "0 10px 20px rgba(31,92,61,0.22)",
                }}
              />
            )}
            <h2 style={{ marginBottom: 6 }}>{item.name}</h2>
            {item.designation && <p style={{ marginBottom: 4 }}>{item.designation}</p>}
            {item.address && <p style={{ marginBottom: 4 }}>{item.address}</p>}
            {(item.area || item.territory) && (
              <p style={{ marginBottom: 4 }}>{item.area || item.territory}</p>
            )}
            <p style={{ marginBottom: 4 }}>
              {item.district ? `${item.district}, ` : ""}
              {item.division}
            </p>
            {item.phone && <p style={{ marginBottom: 4 }}>{t("Phone")}: {item.phone}</p>}
            {item.email && <p style={{ marginBottom: 4 }}>{t("Email")}: {item.email}</p>}

            <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {item.link && (
                <LeafButton href={normalizeLink(item.link)} target="_blank" rel="noreferrer">
                  {t("Visit / Contact")}
                </LeafButton>
              )}
              <LeafButton to={cfg.listPath} variant="outline" size="sm">
                {t("Back to")} {t(cfg.listLabel)}
              </LeafButton>
            </div>
          </div>

          <div>
            <p className="form-note" style={{ marginBottom: 10, textAlign: "center" }}>
              {t("Located in")}{" "}
              <strong>
                {item.district ? `${item.district}, ` : ""}
                {t(item.division)}
              </strong>
            </p>
            <LazyOnVisible minHeight={380}>
              <Suspense fallback={<div className="district3d-loading-fallback" style={{ height: 380 }} />}>
                <District3DMap
                  height={380}
                  counts={districtCounts}
                  highlightDistrict={item.district}
                  markerLat={item.lat}
                  markerLng={item.lng}
                  markerName={item.name}
                  onDistrictSelect={({ division }) => navigate(`${cfg.listPath}?division=${encodeURIComponent(division)}`)}
                />
              </Suspense>
            </LazyOnVisible>
          </div>
        </div>
      </section>
    </div>
  );
}