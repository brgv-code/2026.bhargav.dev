"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export type WritingPostSearchItem = {
  slug: string;
  title: string;
};

type Props = {
  posts: WritingPostSearchItem[];
};

export function WritingPostSearch({ posts }: Props) {
  const router = useRouter();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return posts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(t) ||
          p.slug.toLowerCase().includes(t),
      )
      .slice(0, 8);
  }, [posts, q]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [close]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filtered[0]) {
      router.push(`/writing/${filtered[0].slug}`);
      setQ("");
      close();
    }
    if (e.key === "Escape") close();
  };

  return (
    <div ref={containerRef} className="relative w-search shrink-0">
      <label htmlFor={`${listId}-search`} className="sr-only">
        Search posts
      </label>
      <Search
        size={13}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        id={`${listId}-search`}
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search…"
        autoComplete="off"
        className="w-search border border-border bg-highlight py-1.5 pl-8 pr-4 text-sm text-primary placeholder:text-muted transition-all duration-slow focus:w-search-focus focus:border-border-focus focus:outline-none"
        aria-autocomplete="list"
      />
      {open && q.trim() && filtered.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute right-0 top-full z-dropdown mt-1 max-h-64 min-w-full overflow-auto border border-border bg-surface py-1 shadow-md"
        >
          {filtered.map((p) => (
            <li key={p.slug} role="option" aria-selected="false">
              <Link
                href={`/writing/${p.slug}`}
                className="block px-3 py-2 text-left text-xs text-primary hover:bg-interactive-hover"
                onClick={() => {
                  setQ("");
                  close();
                }}
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
