"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PenLine,
  Terminal,
  Briefcase,
  User,
  Bug,
  Heart,
  Layers,
  StickyNote,
  BookOpen,
} from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/writing", label: "Writing", icon: PenLine },
  { href: "/projects", label: "Projects", icon: Terminal },
  { href: "/experience", label: "Experience", icon: Briefcase },
  { href: "/about", label: "About", icon: User },
  { href: "/error-logs", label: "Error Logs", icon: Bug },
  { href: "/favorites", label: "Favourites", icon: Heart },
  { href: "/series", label: "Series", icon: Layers },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/reading", label: "Reading", icon: BookOpen },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 py-2 text-sm transition-colors ${
              isActive
                ? "border-l-2 border-accent pl-4 text-accent font-semibold"
                : "pl-4 text-muted hover:text-accent"
            }`}
          >
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
