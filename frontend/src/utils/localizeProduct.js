import { bn } from "../i18n/bn";

// Picks the Bangla version of a product's text fields when the site is
// set to Bangla: the admin-entered Bangla field first, then the built-in
// dictionary (for the standard product range), then the English text.
export function localizeProduct(product, lang) {
  if (!product) return product;
  if (lang !== "bn") return product;

  const pick = (field) => product[`${field}Bn`] || bn[product[field]] || product[field];
  return {
    ...product,
    name: pick("name"),
    shortDescription: pick("shortDescription"),
    description: pick("description"),
  };
}
