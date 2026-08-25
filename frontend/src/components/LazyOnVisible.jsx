import { useEffect, useRef, useState } from "react";

/**
 * Renders nothing until this element is about to scroll into view, then
 * mounts its children (and only then do any lazy-loaded chunks/network
 * requests inside them actually start). Reserves `minHeight` up front so
 * the page doesn't jump once the real content mounts.
 */
export default function LazyOnVisible({ children, minHeight, rootMargin = "300px" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible || !ref.current) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      // Very old browsers: just render immediately rather than never.
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={!visible ? { minHeight } : undefined}>
      {visible ? children : null}
    </div>
  );
}
