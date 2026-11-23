// Turns text into a URL-friendly "slug", e.g. "Pure Gypsum" -> "pure-gypsum".
// Only English letters and digits are kept, so every product URL stays clean.
function slugify(text) {
  return String(text || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

// Page addresses chosen by the site owner for the products that already exist.
// (Product id -> slug.) Once Google has indexed an address it should not change.
const FIXED_SLUGS = {
  "6b03012bd28bf76f0bbd0dbc": "alex-hit-4-cpa",
  "6aad6762861c31df401fabcf": "alex-gibberellic-ga3",
  "6aad6762861c31df401fabd0": "at-pure-gip-gypsum",
  "6aad6762861c31df401fabd1": "alex-s-boron",
  "6aad6762861c31df401fabd2": "alex-humaster-humic-acid",
  "6aad6762861c31df401fabd3": "alex-zinc-mono",
  "6aad6762861c31df401fabd4": "alex-boric-acid",
  "6aad6762861c31df401fabd5": "alex-chelated-zinc",
};

// Picks the text a new product's slug is made from. Many product names are
// in Bangla (no English letters), so then the first words of the English
// image description (alt text) are used instead.
function slugSourceFor(product) {
  const latinLetters = (String(product.name || "").match(/[A-Za-z]/g) || []).length;
  if (latinLetters >= 3) return product.name;
  const alt = String(product.altText || "").split(/\s+/).filter(Boolean).slice(0, 5).join(" ");
  return alt;
}

// Returns a slug that no other document of `Model` uses yet
// (pure-gypsum, pure-gypsum-2, pure-gypsum-3 ...).
async function uniqueSlug(Model, wanted, excludeId) {
  const base = slugify(wanted) || "product";
  let candidate = base;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

// Gives every product that has no slug yet one (runs once at server start,
// so products added before the SEO update get their own page address too).
async function backfillProductSlugs(Product) {
  const missing = await Product.find({ $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }] });
  for (const product of missing) {
    const wanted = FIXED_SLUGS[String(product._id)] || slugSourceFor(product);
    // eslint-disable-next-line no-await-in-loop
    const slug = await uniqueSlug(Product, wanted, product._id);
    // eslint-disable-next-line no-await-in-loop
    await Product.updateOne({ _id: product._id }, { $set: { slug } });
  }
  if (missing.length) console.log(`Product slugs created for ${missing.length} product(s).`);
}

module.exports = { slugify, slugSourceFor, uniqueSlug, backfillProductSlugs, FIXED_SLUGS };
