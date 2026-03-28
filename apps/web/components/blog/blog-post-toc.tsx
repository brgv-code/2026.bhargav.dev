"use client";

import { useEffect, useState, useCallback } from "react";
import type { PayloadTocItem } from "@/lib/data/cms";

type Props = {
  items: PayloadTocItem[] | null | undefined;
};

const STICKY_BAR_HEIGHT = 56; // h-14
const ROOT_MARGIN = "-15% 0px -75% 0px";

export function BlogPostTOC({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!items?.length) return;

    const ids = items.map((i) => i.id);
    const container = document.getElementById("main-scroll");
    const intersectingIds = new Set<string>();

    const onIntersect: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        if (!id || !ids.includes(id)) continue;
        if (entry.isIntersecting) intersectingIds.add(id);
        else intersectingIds.delete(id);
      }
      const first = ids.find((id) => intersectingIds.has(id));
      setActiveId(first ?? null);
    };

    const observer = new IntersectionObserver(onIntersect, {
      root: container ?? null,
      rootMargin: ROOT_MARGIN,
      threshold: 0,
    });

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [items]);

  const handleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    const container = document.getElementById("main-scroll");
    if (container) {
      const targetTop = target.getBoundingClientRect().top
        - container.getBoundingClientRect().top
        + container.scrollTop
        - STICKY_BAR_HEIGHT;
      container.scrollTo({ top: targetTop, behavior: "smooth" });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setActiveId(id);
  }, []);

  if (!items?.length) return null;

  return (
    <nav aria-label="Table of contents">
      <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-muted border-b border-border pb-3">
        In this article
      </p>
      <ol className="flex flex-col gap-0.5 list-none">
        {items.map((item, i) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => handleClick(e, item.id)}
                className={`flex items-baseline gap-2 py-1.5 px-3 text-xs leading-snug border-l-2 transition-colors -ml-px ${
                  isActive
                    ? "border-accent text-primary font-medium bg-accent/5"
                    : "border-transparent text-muted hover:text-primary hover:border-accent/40"
                }`}
                style={item.level > 2 ? { paddingLeft: `${12 + (item.level - 2) * 10}px` } : undefined}
              >
                <span className="shrink-0 text-[10px] tabular-nums font-bold text-accent/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
