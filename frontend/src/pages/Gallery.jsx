import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../context/LanguageContext";

export default function Gallery() {
  const { t } = useLanguage();
  return (
    <div>
      <PageHeader eyebrow="Moments From the Field" title="Gallery" description="Photos and videos from farmer trainings, dealer visits and field days." />
      <section className="section">
        <div className="container grid grid--2">
          <Link to="/gallery/photos" className="card tile" style={{ display: "block", padding: 32 }}>
            <h2>{t("Photo")}</h2>
            <p>{t("Browse photos from events, trainings and field visits.")}</p>
          </Link>
          <Link to="/gallery/videos" className="card tile" style={{ display: "block", padding: 32 }}>
            <h2>{t("Videos")}</h2>
            <p>{t("Watch highlights and short explainers from our team.")}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
