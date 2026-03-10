"use client";

import { usePathname } from "next/navigation";
import { useSound } from "@/components/providers/sound-provider";
import { NavbarHomeStrip } from "./navbar-home-strip";
import { NavbarNavLinks } from "./navbar-nav-links";

type NavbarProps = {
  /** When on homepage, show this as "N Contributions this week". */
  contributionCount?: number;
};

export function Navbar({ contributionCount }: NavbarProps) {
  const pathname = usePathname();
  const { playClick } = useSound();
  const isHome = pathname === "/";

  return (
    <header
      data-theme="editorial"
      className="w-full shrink-0 border-b border-[var(--editorial-border)] bg-[var(--editorial-bg)]/90 backdrop-blur-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
        {isHome ? (
          <NavbarHomeStrip contributionCount={contributionCount} />
        ) : (
          <NavbarNavLinks onNavClick={playClick} />
        )}
      </div>
    </header>
  );
}
