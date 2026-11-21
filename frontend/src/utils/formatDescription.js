// Turns the text typed in the admin "Full description" box into display blocks.
// The text is shown the way it was typed: every line stays its own line and
// blank lines stay as spacing. Optional extras: "# Heading", "- bullet", **bold**.
export function parseDescription(input) {
  if (!input) return [];
  let text = String(input).replace(/\r\n?/g, "\n").trim();

  // Only when everything was saved on ONE line (no line breaks at all),
  // put headings and bullets back on their own lines.
  if (!text.includes("\n")) {
    text = text
      .replace(/\s+(#{1,4}\s)/g, "\n$1")
      .replace(/([।.!?:])\s+-\s+/g, "$1\n- ")
      .replace(/\s+(\*\*[^*]+\*\*)\s*$/, "\n$1");
  }

  const blocks = [];
  let list = null;
  let lastWasBlank = false;

  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    if (!line) {
      list = null;
      if (blocks.length && !lastWasBlank) blocks.push({ type: "gap" });
      lastWasBlank = true;
      return;
    }
    lastWasBlank = false;

    const heading = line.match(/^#{1,4}\s+(.*)$/);
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (heading) {
      list = null;
      blocks.push({ type: "heading", text: heading[1] });
    } else if (bullet) {
      if (!list) {
        list = { type: "list", items: [] };
        blocks.push(list);
      }
      list.items.push(bullet[1]);
    } else {
      list = null;
      blocks.push({ type: "text", text: line });
    }
  });

  while (blocks.length && blocks[blocks.length - 1].type === "gap") blocks.pop();
  return blocks;
}

// Splits "a **b** c" into [{text:"a ",bold:false},{text:"b",bold:true},...]
export function parseInline(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4
        ? { text: part.slice(2, -2), bold: true }
        : { text: part, bold: false }
    );
}
