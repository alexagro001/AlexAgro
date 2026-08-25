import { BD_SHAPE_VIEWBOX, BD_SHAPE_PATH, BD_DIVISION_POSITIONS } from "../bdShape";
import { useLanguage } from "../context/LanguageContext";
import { playClickSound } from "../utils/sound";

/**
 * A stylized illustration of Bangladesh's actual national outline (built
 * from real boundary coordinates, not a generic rectangle), filled with a
 * dot-texture and dotted with one marker per division positioned at its
 * true geographic location. Tapping a division filters the dealer/officer
 * list shown below it.
 */
export default function DivisionMap({ selected, onSelect, counts = {} }) {
  const { t } = useLanguage();

  const handleSelect = (name) => {
    playClickSound();
    onSelect(selected === name ? "All" : name);
  };

  return (
    <div className="bd-shape">
      <svg viewBox={BD_SHAPE_VIEWBOX} className="bd-shape__svg" aria-hidden="true">
        <defs>
          <pattern id="bdDots" width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="var(--canopy-green)" opacity="0.4" />
          </pattern>
        </defs>
        <path d={BD_SHAPE_PATH} fill="url(#bdDots)" stroke="var(--canopy-green)" strokeWidth="2" strokeLinejoin="round" />
      </svg>

      {Object.entries(BD_DIVISION_POSITIONS).map(([name, pos]) => {
        const isActive = selected === name;
        return (
          <button
            key={name}
            type="button"
            className={`bd-shape__pin ${isActive ? "is-active" : ""}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => handleSelect(name)}
          >
            <span className="bd-shape__dot">
              {typeof counts[name] === "number" && <em>{counts[name]}</em>}
            </span>
            <span className="bd-shape__label">{t(name)}</span>
          </button>
        );
      })}
    </div>
  );
}
