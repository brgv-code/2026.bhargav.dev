import Link from "next/link";
import type { ReactNode } from "react";

export type SidebarLinkItem = {
  key: string | number;
  href: string;
  label: ReactNode;
};

type Props = {
  id: string;
  title: string;
  viewAllHref: string;
  items: SidebarLinkItem[];
};

export function SidebarLinkPanel({ id, title, viewAllHref, items }: Props) {
  if (!items.length) return null;

  return (
    <aside className="hidden min-h-0 xl:block" aria-labelledby={id}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2
          id={id}
          className="text-2xs font-mono uppercase tracking-widest text-muted"
        >
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="text-2xs text-muted hover:text-primary transition-colors duration-normal"
        >
          View all →
        </Link>
      </div>
      <nav className="flex flex-col" aria-label={title}>
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="group flex flex-col gap-1 border-b border-border px-5 py-4 transition-colors duration-normal hover:bg-interactive-hover"
          >
            <span className="text-sm font-semibold leading-snug text-primary transition-colors duration-normal group-hover:text-accent">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
