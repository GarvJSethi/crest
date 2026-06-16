"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface UseIntersectionOptions {
  /** Root margin (default: "0px") */
  rootMargin?: string;
  /** Intersection threshold 0-1 (default: 0.1) */
  threshold?: number | number[];
  /** Only trigger once (default: true) */
  triggerOnce?: boolean;
}

/**
 * Hook to observe when an element enters the viewport.
 * Useful for scroll-triggered animations and lazy loading.
 * @example
 * const { ref, isInView } = useIntersection({ triggerOnce: true });
 * return <div ref={ref} className={isInView ? "animate-in" : "opacity-0"}>Content</div>;
 */
export function useIntersection<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionOptions = {}
): { ref: RefObject<T | null>; isInView: boolean } {
  const { rootMargin = "-100px", threshold = 0.1, triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold, triggerOnce]);

  return { ref, isInView };
}
