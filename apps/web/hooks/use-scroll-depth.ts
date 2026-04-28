"use client";

import { useEffect, useRef } from "react";
import { trackScrollDepth } from "@/lib/analytics";

export function useScrollDepth(thresholds: number[] = [25, 50, 75, 100]) {
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    fired.current.clear();

    const handleScroll = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = (window.scrollY / scrollable) * 100;

      thresholds.forEach((threshold) => {
        if (pct >= threshold && !fired.current.has(threshold)) {
          fired.current.add(threshold);
          trackScrollDepth(threshold);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [thresholds]);
}
