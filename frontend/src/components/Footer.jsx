import { Link } from "react-router-dom";
import { site } from "../siteConfig";
import { useLanguage } from "../context/LanguageContext";
import { gmailComposeLink } from "../utils/links";

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
            <li style={{ color: "rgba(246,241,228,0.9)", fontWeight: 700 }}>{site.address}</li>
            <li><a href={`tel:${site.phone.replace(/\s/g, "")}`} style={{ fontWeight: 700 }}>{site.phone}</a></li>
            <li><a href={gmailComposeLink(site.email)} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>{site.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        Copyright &copy; {new Date().getFullYear()} {site.legalName}. All rights reserved.
      </div>
    </footer>
  );
}
