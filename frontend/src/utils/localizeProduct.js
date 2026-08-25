// Picks the Bangla version of a product's text fields when the site is
// set to Bangla and the admin has actually filled one in — falling back
// to the English field otherwise, so nothing breaks for products that
// only have the English version filled in.
export function localizeProduct(product, lang) {
  if (!product) return product;
  if (lang !== "bn") return product;

  return {
    ...product,
    name: product.nameBn || product.name,
    shortDescription: product.shortDescriptionBn || product.shortDescription,
    description: product.descriptionBn || product.description,
  };
}
