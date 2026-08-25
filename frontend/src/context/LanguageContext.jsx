import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { bn } from "../i18n/bn";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("alexagro_lang") || "en");

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "bn" : "en";
      localStorage.setItem("alexagro_lang", next);
      return next;
    });
  }, []);

  // t(text) looks up the English source string in the Bangla dictionary.
  // Falls back to the original English text if no translation exists yet —
  // so adding new UI copy never breaks the language switch, it just stays
  // in English until a translation is added to src/i18n/bn.js.
  const t = useCallback(
    (text) => {
      if (lang === "bn" && bn[text]) return bn[text];
      return text;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
