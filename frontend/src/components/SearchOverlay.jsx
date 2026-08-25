import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ dealers: [], distributors: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ dealers: [], distributors: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [dealerRes, distributorRes] = await Promise.all([
          api.get("/dealers", { params: { q: query } }),
          api.get("/distributors", { params: { q: query } }),
        ]);
        setResults({ dealers: dealerRes.data, distributors: distributorRes.data });
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = results.dealers.length + results.distributors.length;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-overlay__inner">
        <div className="search-panel" onClick={(e) => e.stopPropagation()}>
          <div className="search-panel__input-row">
            <input
              ref={inputRef}
              type="text"
              placeholder={t("Search dealers or sales officers by name, area or district...")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="search-panel__close" onClick={onClose} aria-label="Close search">
              &times;
            </button>
          </div>

          <div className="search-panel__results">
          {loading && <p className="loading-state">{t("Searching")}...</p>}

          {!loading && query.trim() && totalResults === 0 && (
            <p className="empty-state">{t("No dealers or sales officers matched")} "{query}".</p>
          )}

          {!loading &&
            results.dealers.map((d) => (
              <Link
                key={d._id}
                className="search-result"
                to={`/network/dealers/${d._id}`}
                onClick={onClose}
              >
                <div>
                  <div className="search-result__name">{d.name}</div>
                  <div className="search-result__meta">
                    {[d.area, d.district, d.division].filter(Boolean).join(", ")}
                  </div>
                </div>
                <span className="search-result__type">{t("Dealer")}</span>
              </Link>
            ))}

          {!loading &&
            results.distributors.map((d) => (
              <Link
                key={d._id}
                className="search-result"
                to={`/network/sales-officers/${d._id}`}
                onClick={onClose}
              >
                <div>
                  <div className="search-result__name">{d.name}</div>
                  <div className="search-result__meta">
                    {[d.designation, d.territory, d.division].filter(Boolean).join(", ")}
                  </div>
                </div>
                <span className="search-result__type">{t("Sales Officer")}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
