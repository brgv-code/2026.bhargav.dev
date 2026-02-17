"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PixelCalendar, PixelHeart } from "./pixel-icons";
import { SettingsPanel } from "./settings-panel";
import { useSound } from "./providers/sound-provider";

export function Navbar() {
  const pathname = usePathname();
  const { playClick } = useSound();

  const handleNavClick = () => {
    playClick();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm">
      <div className="max-w-xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          onClick={handleNavClick}
          className="text-sm font-medium tracking-tight text-foreground/90 hover:text-foreground transition-colors"
        >
          bhargav.dev
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/"
            onClick={handleNavClick}
            className={`text-sm transition-colors ${
              pathname === "/"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            home
          </Link>
          <Link
            href="/streaks"
            onClick={handleNavClick}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              pathname === "/streaks"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PixelCalendar className="w-3.5 h-3.5" />
            <span>streaks</span>
          </Link>
          <Link
            href="/favorites"
            onClick={handleNavClick}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              pathname === "/favorites"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PixelHeart className="w-3.5 h-3.5" />
            <span>favorites</span>
          </Link>
          <SettingsPanel />
        </div>
      </div>
    </nav>
  );
}
