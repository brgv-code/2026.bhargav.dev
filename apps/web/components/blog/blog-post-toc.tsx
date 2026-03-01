"use client";

import { useEffect, useState } from "react";
import type { PayloadTocItem } from "@/lib/payload";

type Props = {
  items: PayloadTocItem[] | null | undefined;
};

const ROOT_MARGIN = "-20% 0px -70% 0px";

export function BlogPostTOC({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!items?.length) return;

    const ids = items.map((i) => i.id);

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
      rootMargin: ROOT_MARGIN,
      threshold: 0,
    });

    const observe = () => {
      const elements = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el != null);
      elements.forEach((el) => observer.observe(el));
      return () => elements.forEach((el) => observer.unobserve(el));
    };

    const cleanup = observe();

    return () => {
      cleanup();
      observer.disconnect();
    };
  }, [items]);

  if (!items?.length) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-[10px] font-mono text-[var(--editorial-text-dim)] uppercase tracking-widest pb-2 border-b border-[var(--editorial-border)]">
        on this page
      </div>
      <ul className="list-none flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`block text-[13px] py-1.5 px-2 rounded-sm border-l-2 -ml-0.5 transition-colors leading-snug ${
                  isActive
                    ? "text-[var(--editorial-text)] border-[var(--editorial-accent)] bg-[rgba(200,75,47,0.05)]"
                    : "text-[var(--editorial-text-muted)] border-transparent hover:text-[var(--editorial-text)] hover:border-[var(--editorial-accent)] hover:bg-[rgba(200,75,47,0.05)]"
                }`}
                style={
                  item.level > 2
                    ? { paddingLeft: `${8 + (item.level - 2) * 10}px` }
                    : undefined
                }
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
