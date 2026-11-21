// Turns the simple markdown-style text admins paste into product
// descriptions (### headings, "- " bullets, **bold**) into tidy HTML,
// instead of showing the raw symbols.
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

export default function FormattedText({ text, className = "" }) {
  if (!text) return null;

  // Descriptions are sometimes saved on one line; put headings and
  // bullets back on their own lines first.
  const normalized = String(text)
    .replace(/\r/g, "")
    .replace(/\s+(#{1,4}\s)/g, "\n$1")
    .replace(/([।.!?:])\s+-\s+/g, "$1\n- ")
    .replace(/\s+(\*\*[^*]+\*\*)\s*$/g, "\n$1");

  const blocks = [];
  let list = null;
  normalized.split("\n").forEach((raw) => {
    const line = raw.trim();
    if (!line) { list = null; return; }
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (heading) {
      list = null;
      blocks.push({ type: "h", text: heading[1] });
    } else if (bullet) {
      if (!list) { list = { type: "ul", items: [] }; blocks.push(list); }
      list.items.push(bullet[1]);
    } else {
      list = null;
      blocks.push({ type: "p", text: line });
    }
  });

  return (
    <div className={`formatted-text ${className}`}>
      {blocks.map((b, i) => {
        if (b.type === "h") return <h4 key={i}>{inline(b.text)}</h4>;
        if (b.type === "ul") return <ul key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>;
        return <p key={i}>{inline(b.text)}</p>;
      })}
    </div>
  );
}
