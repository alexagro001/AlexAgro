import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { playClickSound } from "../utils/sound";

export default function FloatingContact() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = () => {
    playClickSound();
    navigate("/contact");
  };

  return (
    <div className="floating-contact">
      <svg className="floating-contact__branch" viewBox="0 0 90 40" aria-hidden="true">
        <path d="M90 6 C 60 2, 30 10, 8 26" stroke="#1F5C3D" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M40 8 C 34 2, 26 1, 20 4" stroke="#1F5C3D" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M28 5 C 24 -1, 16 -3, 10 0" fill="#8FBF3F" />
        <path d="M46 6 C 42 0, 34 -2, 28 1" fill="#1F5C3D" />
        <path d="M14 22 C 10 16, 2 14, -4 17" fill="#8FBF3F" opacity="0.9" />
      </svg>

      <button type="button" className="floating-contact__widget" onClick={handleClick}>
        <span className="floating-contact__thread" />
        <span className="floating-contact__badge">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 18C10 18 16 12.5 16 8A6 6 0 104 8C4 12.5 10 18 10 18Z" fill="#fff" />
          </svg>
          Alex Agro
        </span>
        <span className="floating-contact__cta">{t("Contact Us")}</span>
      </button>
    </div>
  );
}
