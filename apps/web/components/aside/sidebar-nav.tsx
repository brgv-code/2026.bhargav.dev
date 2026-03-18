"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/writing", label: "Writing" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-col gap-5">
      {links.map(({ href, label }) => {
        const isActive =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm transition-colors hover:text-accent ${
              isActive
                ? "text-primary font-medium underline underline-offset-4 decoration-1"
                : "text-secondary"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
