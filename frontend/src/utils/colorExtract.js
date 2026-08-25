// Samples an image's real pixel data to find its dominant color, using
// the Canvas API. This is derived directly from whatever photo the admin
// uploaded — it's not a designed or painted effect, the color comes
// straight out of the actual image.
export function extractDominantColor(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl) return resolve(null);

    const img = new Image();
    img.crossOrigin = "anonymous"; // needed for non-data-URI (external) URLs
    img.onload = () => {
      try {
        const size = 32; // small sample is plenty and fast
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 100) continue; // skip transparent pixels
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (count === 0) return resolve(null);

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        resolve({ r, g, b });
      } catch (err) {
        // Canvas can be "tainted" by cross-origin images without CORS
        // headers — fail quietly and just skip the color effect.
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}
