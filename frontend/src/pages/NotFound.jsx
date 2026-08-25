import { Link } from "react-router-dom";
import LeafButton from "../components/LeafButton";
import { useLanguage } from "../context/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="section" style={{ textAlign: "center" }}>
      <div className="container">
        <div className="eyebrow">404</div>
        <h1>{t("This page has wandered off the field.")}</h1>
        <p>{t("The page you're looking for doesn't exist or has moved.")}</p>
        <LeafButton to="/">{t("Back to Home")}</LeafButton>
      </div>
    </div>
  );
}
