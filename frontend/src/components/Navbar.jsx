import { useState } from "react";
import { NavLink } from "react-router-dom";
import { navigation, site } from "../siteConfig";
import { useLanguage } from "../context/LanguageContext";
import { isSoundEnabled, setSoundEnabled, playClickSound } from "../utils/sound";
import SearchOverlay from "./SearchOverlay";

function NavLeaf() {
  return (
    <svg className="navbar__leaf-icon" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 14C1 9 3 3 14 2 13 10 8 14 2 14Z"
        fill="currentColor"
      />
      <path d="M3 13C6 10 9 7 13 3" stroke="var(--root-brown)" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleSoundToggle = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playClickSound();
  };

  const toggleMobileGroup = (label) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__bar">
          <NavLink to="/" className="navbar__brand" onClick={() => setMobileOpen(false)}>
            <span className="navbar__brand-chip">
              <img src="/logo-full.png" alt={t(site.name)} />
            </span>
          </NavLink>

          <button
            className="navbar__burger"
            type="button"
            aria-label={t(mobileOpen ? "Close navigation menu" : "Open navigation menu")}
            aria-expanded={mobileOpen}
            aria-controls="navbar-menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {mobileOpen ? (
                <path d="m4 4 12 12M16 4 4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M2 4h16M2 10h16M2 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>

          <div id="navbar-menu" className={`navbar__menu ${mobileOpen ? "is-open" : ""}`}>
            <ul className="navbar__links">
              {navigation.map((item) => (
                <li
                  key={item.label}
                  className={`navbar__link ${openMenu === item.label ? "is-open" : ""}`}
                >
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleMobileGroup(item.label)}
                        aria-expanded={openMenu === item.label}
                      >
                        <NavLeaf />
                        {t(item.label)}
                        <span className="navbar__caret" />
                      </button>
                      <div className="navbar__dropdown">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={() => {
                              setMobileOpen(false);
                              setOpenMenu(null);
                            }}
                          >
                            {t(child.label)}
                          </NavLink>
                        ))}
                      </div>
                    </>
                  ) : (
                    <NavLink to={item.to} onClick={() => setMobileOpen(false)}>
                      <NavLeaf />
                      {t(item.label)}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>

            <div className="navbar__actions">
              <button
                className="navbar__lang-btn"
                onClick={toggleLanguage}
                aria-label={t("Switch language")}
                title={lang === "en" ? "বাংলায় দেখুন" : "View in English"}
              >
                {lang === "en" ? "বাং" : "EN"}
              </button>

              <button
                className="navbar__icon-btn"
                onClick={handleSoundToggle}
                aria-label={t(soundOn ? "Mute sound effects" : "Enable sound effects")}
                title={t(soundOn ? "Mute sound effects" : "Enable sound effects")}
              >
                {soundOn ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 6v4h3l4 3V3L5 6H2Z" fill="currentColor" />
                    <path d="M11 5.5c1 .8 1 4.2 0 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 6v4h3l4 3V3L5 6H2Z" fill="currentColor" />
                    <path d="M10.5 6.5l3 3M13.5 6.5l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              <button
                className="navbar__icon-btn"
                aria-label={t("Search dealers and distributors")}
                onClick={() => {
                  setSearchOpen(true);
                  setMobileOpen(false);
                }}
              >
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <circle cx="7.2" cy="7.2" r="5.7" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M11.5 11.5L15.5 15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
