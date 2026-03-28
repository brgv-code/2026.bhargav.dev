"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Top-level pages → back to Home
const TOP_LEVEL_PARENTS: Record<string, { label: string; href: string }> = {
  "/writing":    { label: "Home", href: "/" },
  "/projects":   { label: "Home", href: "/" },
  "/experience": { label: "Home", href: "/" },
  "/about":      { label: "Home", href: "/" },
  "/favorites":  { label: "Home", href: "/" },
  "/series":     { label: "Home", href: "/" },
  "/notes":      { label: "Home", href: "/" },
  "/reading":    { label: "Home", href: "/" },
  "/streaks":    { label: "Home", href: "/" },
};

// Section labels for nested pages (e.g. /writing/[slug] → Writing)
const SECTION_LABELS: Record<string, string> = {
  writing:    "Writing",
  projects:   "Projects",
  notes:      "Notes",
  series:     "Series",
  favorites:  "Favorites",
  reading:    "Reading",
};

export function HeaderBackButton() {
  const pathname = usePathname();

  // Nothing on homepage
  if (pathname === "/") return null;

  // Direct top-level match (e.g. /writing, /about)
  const direct = TOP_LEVEL_PARENTS[pathname];
  if (direct) {
    return <BackLink href={direct.href} label={direct.label} />;
  }

  // Nested page (e.g. /writing/my-article, /notes/2024-01-01)
  // → go up one level with section label
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const section = segments[0];
    const parentPath = `/${section}`;
    const label = SECTION_LABELS[section] ?? (section.charAt(0).toUpperCase() + section.slice(1));
    return <BackLink href={parentPath} label={label} />;
  }

  return null;
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-primary transition-colors"
    >
      <ArrowLeft size={14} aria-hidden="true" />
      {label}
    </Link>
  );
}
