// Turns a product name into a URL-friendly "slug", e.g. "Pure Gypsum" -> "pure-gypsum".
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
    // eslint-disable-next-line no-await-in-loop
    const slug = await uniqueSlug(Product, product.name, product._id);
    // eslint-disable-next-line no-await-in-loop
    await Product.updateOne({ _id: product._id }, { $set: { slug } });
  }
  if (missing.length) console.log(`Product slugs created for ${missing.length} product(s).`);
}

module.exports = { slugify, uniqueSlug, backfillProductSlugs };
