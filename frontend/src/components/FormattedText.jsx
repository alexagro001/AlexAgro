import { parseDescription, parseInline } from "../utils/formatDescription";

function Inline({ text }) {
  return parseInline(text).map((part, i) =>
    part.bold ? <strong key={i}>{part.text}</strong> : <span key={i}>{part.text}</span>
  );
}

export default function FormattedText({ text, className = "" }) {
  const blocks = parseDescription(text);
  if (!blocks.length) return null;

  return (
    <div className={`formatted-text ${className}`}>
      {blocks.map((block, i) => {
        if (block.type === "heading") return <h4 key={i}><Inline text={block.text} /></h4>;
        if (block.type === "gap") return <div key={i} className="formatted-text__gap" aria-hidden="true" />;
        if (block.type === "list") {
          return (
            <ul key={i}>
              {block.items.map((item, j) => <li key={j}><Inline text={item} /></li>)}
            </ul>
          );
        }
        return <p key={i}><Inline text={block.text} /></p>;
      })}
    </div>
  );
}
