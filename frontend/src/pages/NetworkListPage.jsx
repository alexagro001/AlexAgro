import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import LeafIcon from "../components/LeafIcon";
import LazyOnVisible from "../components/LazyOnVisible";
import api from "../api/axios";
import { normalizeLink } from "../utils/links";
import { useLanguage } from "../context/LanguageContext";

const District3DMap = lazy(() => import("../components/District3DMap"));

const CONFIG = {
  dealer: {
    endpoint: "/dealers",
    title: "Dealer List",
    description: "Every registered dealer, plotted where they operate. Tap a pin or a card to reach them.",
    metaFields: (d) => [d.area, d.district, d.division].filter(Boolean).join(", "),
    detailPath: (id) => `/network/dealers/${id}`,
  },
  distributor: {
    endpoint: "/distributors",
    title: "Sales Officer",
    description: "Territory sales officers covering every division — reach yours directly.",
    metaFields: (d) => [d.designation, d.territory, d.division].filter(Boolean).join(", "),
    detailPath: (id) => `/network/sales-officers/${id}`,
  },
};

export default function NetworkListPage({ kind }) {
  const cfg = CONFIG[kind];
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [division, setDivision] = useState(searchParams.get("division") || "All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fromUrl = searchParams.get("division");
    if (fromUrl) setDivision(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    api
      .get(cfg.endpoint)
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Failed to load network list", err))
      .finally(() => setLoading(false));
  }, [kind]);

  const districtCounts = useMemo(() => {
    const counts = {};
    items.forEach((i) => {
      if (i.district) counts[i.district] = (counts[i.district] || 0) + 1;
    });
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchesDivision = division === "All" || i.division === division;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        i.name.toLowerCase().includes(q) ||
        (i.district || "").toLowerCase().includes(q) ||
        (i.area || i.territory || "").toLowerCase().includes(q);
      return matchesDivision && matchesQuery;
    });
  }, [items, division, query]);

  return (
    <div>
      <PageHeader eyebrow="Distribution Network" title={cfg.title} description={cfg.description} />

      <section className="section">
        <div className="container">
          <div className="field" style={{ maxWidth: 420, marginBottom: 16 }}>
            <label htmlFor="network-search">{t("Search by name, area or district")}</label>
            <input
              id="network-search"
              type="text"
              placeholder="e.g. Bogura, Savar, Karim Agro Center..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {loading && <p className="loading-state">{t("Loading network data...")}</p>}

          {!loading && (
            <>
              {filtered.length === 0 ? (
                <p className="empty-state">{t("No results match your search.")}</p>
              ) : (
                <div className="index-list">
                  <div className="index-list__count">
                    {filtered.length} {kind === "dealer" ? t("Dealer List") : t("Sales Officer")}
                  </div>
                  <div className="index-list__scroll">
                    {filtered.map((i) => (
                      <div key={i._id} className="index-row">
                        <span className="index-row__icon"><LeafIcon size={15} /></span>
                        <div className="index-row__main">
                          <Link to={cfg.detailPath(i._id)} className="index-row__name">{i.name}</Link>
                          <span className="index-row__meta">{cfg.metaFields(i)}</span>
                        </div>
                        {i.phone && <span className="index-row__phone">{i.phone}</span>}
                        <div className="index-row__actions">
                          <Link to={cfg.detailPath(i._id)} className="index-row__link">{t("View Details")}</Link>
                          {i.link && (
                            <a href={normalizeLink(i.link)} target="_blank" rel="noreferrer" className="index-row__link">
                              {t("Contact")}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 12 }}>{t("Or browse by district")}</h3>
            <LazyOnVisible minHeight={440}>
              <Suspense fallback={<div className="district3d-loading-fallback" style={{ height: 440 }} />}>
                <District3DMap height={440} counts={districtCounts} onDistrictSelect={({ division }) => setDivision(division)} />
              </Suspense>
            </LazyOnVisible>
          </div>
        </div>
      </section>
    </div>
  );
}
