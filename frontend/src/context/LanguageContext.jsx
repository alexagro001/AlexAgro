import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { bn } from "../i18n/bn";
import { bnPlaces } from "../i18n/places";

const LanguageContext = createContext(null);

const dictionary = { ...bnPlaces, ...bn };
// Admin-typed text often differs only in casing ("alex agro"), so fall back
// to a case-insensitive match.
const dictionaryLower = Object.fromEntries(
  Object.entries(dictionary).map(([key, value]) => [key.toLowerCase(), value])
);
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
const toBnDigits = (value) => String(value).replace(/\d/g, (d) => BN_DIGITS[d]);

const TITLES = {
  en: "Alex Agro — Your Crops Friend",
  bn: "অ্যালেক্স অ্যাগ্রো — আপনার ফসলের বন্ধু",
};

// Looks a string up in the dictionary; comma-separated place lists such as
// "Dhanmondi, Dhaka" are translated part by part.
function lookup(text) {
  if (dictionary[text]) return dictionary[text];
  const caseless = dictionaryLower[text.trim().toLowerCase()];
  if (caseless) return caseless;
  if (text.includes(",")) {
    const parts = text.split(",").map((p) => p.trim());
    if (parts.every((p) => dictionary[p] || !/[A-Za-z]/.test(p))) {
      return parts.map((p) => dictionary[p] || p).join(", ");
    }
  }
  return null;
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("alexagro_lang") || "en");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = TITLES[lang] || TITLES.en;
  }, [lang]);

  // Browsers show form validation popups ("Please fill out this field") in
  // their own UI language; replace them with Bangla while Bangla is active.
  useEffect(() => {
    if (lang !== "bn") return undefined;
    const onInvalid = (e) => {
      const el = e.target;
      const v = el.validity;
      if (!v || typeof el.setCustomValidity !== "function") return;
      let message = "অনুগ্রহ করে সঠিক তথ্য লিখুন।";
      if (v.valueMissing) {
        message = el.type === "file" ? "অনুগ্রহ করে একটি ফাইল বাছাই করুন।" : "অনুগ্রহ করে এই ঘরটি পূরণ করুন।";
      } else if (v.typeMismatch && el.type === "email") {
        message = "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা লিখুন।";
      } else if (v.tooShort) {
        message = `কমপক্ষে ${toBnDigits(el.minLength)}টি অক্ষর লিখুন।`;
      } else if (v.customError && !v.typeMismatch && !v.tooShort && !v.patternMismatch) {
        return;
      }
      el.setCustomValidity(message);
    };
    const onEdit = (e) => e.target.setCustomValidity?.("");
    document.addEventListener("invalid", onInvalid, true);
    document.addEventListener("input", onEdit, true);
    document.addEventListener("change", onEdit, true);
    return () => {
      document.removeEventListener("invalid", onInvalid, true);
      document.removeEventListener("input", onEdit, true);
      document.removeEventListener("change", onEdit, true);
      document.querySelectorAll("input, select, textarea").forEach((el) => el.setCustomValidity(""));
    };
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
      if (lang !== "bn" || typeof text !== "string" || !text) return text;
      const found = lookup(text);
      if (!found && import.meta.env.DEV && /[A-Za-z]/.test(text)) {
        (window.__bnMissing ||= new Set()).add(text);
      }
      return toBnDigits(found || text);
    },
    [lang]
  );

  // n(value) shows numbers (counts, phone numbers, dates) in Bangla digits.
  const n = useCallback((value) => (lang === "bn" ? toBnDigits(value ?? "") : value), [lang]);

  // l(record, field) shows admin-entered text: the record's own Bangla field
  // (e.g. nameBn) when filled in, otherwise a dictionary translation.
  const l = useCallback(
    (record, field) => {
      const value = record?.[field];
      if (lang !== "bn") return value;
      return record?.[`${field}Bn`] || t(value);
    },
    [lang, t]
  );

  const formatDate = useCallback(
    (value, options = { day: "numeric", month: "short", year: "numeric" }) =>
      new Date(value).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", options),
    [lang]
  );

  const value = useMemo(
    () => ({ lang, toggleLanguage, t, n, l, formatDate }),
    [lang, toggleLanguage, t, n, l, formatDate]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
