"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  PenLine,
  Terminal,
  Briefcase,
  User,
  Heart,
  Layers,
  StickyNote,
  BookOpen,
  MoreHorizontal,
} from "lucide-react";

const primaryLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/writing", label: "Writing", icon: PenLine },
  { href: "/projects", label: "Projects", icon: Terminal },
  { href: "/experience", label: "Experience", icon: Briefcase },
  { href: "/about", label: "About", icon: User },
];

const secondaryLinks = [
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/series", label: "Series", icon: Layers },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/reading", label: "Reading", icon: BookOpen },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  secondary,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: "true" }>;
  isActive: boolean;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-sm transition-colors ${
        isActive
          ? "bg-interactive-active text-primary font-medium"
          : secondary
            ? "text-disabled hover:text-muted hover:bg-interactive-hover"
            : "text-muted hover:text-primary hover:bg-interactive-hover"
      }`}
    >
      <Icon size={secondary ? 13 : 15} aria-hidden="true" />
      <span className={secondary ? "text-xs" : ""}>{label}</span>
    </Link>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const hasActiveSecondary = secondaryLinks.some(
    ({ href }) => pathname === href || pathname.startsWith(href + "/")
  );
  const [open, setOpen] = useState(hasActiveSecondary);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav aria-label="Primary" className="flex flex-col">
      {/* Primary links */}
      <div className="flex flex-col gap-0.5">
        {primaryLinks.map(({ href, label, icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            isActive={isActive(href)}
          />
        ))}
      </div>

      {/* More toggle */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-disabled hover:text-muted transition-colors w-full rounded-sm hover:bg-interactive-hover"
        >
          <MoreHorizontal size={13} aria-hidden="true" />
          <span className="uppercase tracking-widest">
            {open ? "Less" : "More"}
          </span>
        </button>

        {/* Secondary links — slide down when open */}
        <div
          className={`overflow-hidden transition-all duration-normal ${
            open ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-0.5 pt-1 border-t border-border-subtle">
            {secondaryLinks.map(({ href, label, icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                icon={icon}
                isActive={isActive(href)}
                secondary
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
