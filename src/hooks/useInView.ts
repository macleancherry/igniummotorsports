import { useCallback, useEffect, useState } from "react";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Reports whether the attached element has scrolled into view. Fires once
 * and then disconnects. Immediately true under prefers-reduced-motion so
 * fade-up content isn't stuck hidden for users who disable motion.
 *
 * Uses a callback ref (rather than a plain ref + effect keyed only on
 * mount) so it still attaches correctly when the element appears later —
 * e.g. behind a conditional render gated on an async data fetch.
 */
export function useInView<T extends HTMLElement>(): [(node: T | null) => void, boolean] {
  const [node, setNode] = useState<T | null>(null);
  const [isInView, setIsInView] = useState(prefersReducedMotion);
  const ref = useCallback((el: T | null) => setNode(el), []);

  useEffect(() => {
    if (isInView || !node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, isInView]);

  return [ref, isInView];
}
