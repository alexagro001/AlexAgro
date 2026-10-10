import { Link } from "react-router-dom";
import { site } from "../siteConfig";
import { useLanguage } from "../context/LanguageContext";
import { gmailComposeLink } from "../utils/links";

function ContactIcon({ name }) {
  const paths = {
    map: <><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.3" /></>,
    phone: <path d="M5.2 3.5 8 3l1.4 4-1.8 1.6a15 15 0 0 0 3.8 3.8l1.6-1.8 4 1.4-.5 2.8a2 2 0 0 1-2.2 1.6A14.5 14.5 0 0 1 3.6 5.7a2 2 0 0 1 1.6-2.2Z" />,
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    facebook: <path d="M13.4 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.2v3H10v8h3.4Z" fill="currentColor" stroke="none" />,
  };

  return (
    <svg
      className={`footer__contact-icon footer__contact-icon--${name}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <svg className="footer__roots" viewBox="0 0 1200 20" preserveAspectRatio="none">
        <path
          d="M0 0 Q 30 18 60 4 T 120 6 Q 150 20 180 5 T 240 4 Q 270 18 300 6 T 360 5 Q 390 19 420 4 T 480 6 Q 510 18 540 5 T 600 4 Q 630 18 660 6 T 720 5 Q 750 19 780 4 T 840 6 Q 870 18 900 5 T 960 4 Q 990 18 1020 6 T 1080 5 Q 1110 19 1140 4 T 1200 6"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
          opacity="0.55"
        />
      </svg>

      <div className="footer__inner">
        <div>
          <h4>{site.name}</h4>
          <p style={{ color: "rgba(246,241,228,0.7)", fontSize: "0.9rem", maxWidth: 260 }}>
            {t(site.description)}
          </p>
        </div>

        <div>
          <h4>{t("Quick Links")}</h4>
          <ul>
            <li><Link to="/about">{t("About Us")}</Link></li>
            <li><Link to="/products/crop-health">{t("Crop Health")}</Link></li>
            <li><Link to="/products/agro-processing">{t("Agro Processing")}</Link></li>
            <li><Link to="/career">{t("Career")}</Link></li>
          </ul>
        </div>

        <div>
          <h4>{t("Our Network")}</h4>
          <ul>
            <li><Link to="/network/dealers">{t("Dealer List")}</Link></li>
            <li><Link to="/network/sales-officers">{t("Sales Officer")}</Link></li>
            <li><Link to="/gallery/photos">{t("Gallery")}</Link></li>
            <li><Link to="/contact">{t("Contact Us")}</Link></li>
          </ul>
        </div>

        <div className="footer__contact-card">
          <h4>{t("Contact Info")}</h4>
          <ul>
            <li>
              <a href={site.mapUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
                <ContactIcon name="map" />
                {site.address} · {t("Open in Google Maps")}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} style={{ fontWeight: 700 }}>
                <ContactIcon name="phone" />
                {site.phone}
              </a>
            </li>
            <li>
              <a href={gmailComposeLink(site.email)} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
                <ContactIcon name="email" />
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.social.facebook} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
                <ContactIcon name="facebook" />
                {t("Facebook Page")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        Copyright &copy; {new Date().getFullYear()} {site.legalName}. All rights reserved.
      </div>
    </footer>
  );
}