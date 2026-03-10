"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PixelCalendar,
  PixelHeart,
  PixelSound,
  PixelSoundOff,
} from "@/components/shared/pixel-icons";
import { useSound } from "@/components/providers/sound-provider";

type NavbarNavLinksProps = {
  onNavClick: () => void;
};

export function NavbarNavLinks({ onNavClick }: NavbarNavLinksProps) {
  const pathname = usePathname();
  const { soundEnabled, setSoundEnabled, playToggle } = useSound();

  return (
    <>
      <Link
        href="/"
        onClick={onNavClick}
        className="font-serif text-2xl font-medium tracking-tight text-[var(--editorial-text)] hover:text-[var(--editorial-accent)] transition-colors"
      >
        bhargav.dev
      </Link>
      <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--editorial-text-muted)] flex items-center gap-6">
        <Link
          href="/"
          onClick={onNavClick}
          className="hover:text-[var(--editorial-text)] transition-colors"
        >
          Home
        </Link>
        <Link
          href="/blog"
          onClick={onNavClick}
          className={
            pathname === "/blog" || pathname?.startsWith("/blog/")
              ? "text-[var(--editorial-text)]"
              : "hover:text-[var(--editorial-text)] transition-colors"
          }
        >
          Blog
        </Link>
        <Link
          href="/streaks"
          onClick={onNavClick}
          className={`flex items-center gap-2 ${pathname === "/streaks" ? "text-[var(--editorial-text)]" : "hover:text-[var(--editorial-text)] transition-colors"}`}
        >
          <PixelCalendar className="w-3.5 h-3.5" />
          <span>Streaks</span>
        </Link>
        <Link
          href="/favorites"
          onClick={onNavClick}
          className={`flex items-center gap-2 ${pathname === "/favorites" ? "text-[var(--editorial-text)]" : "hover:text-[var(--editorial-text)] transition-colors"}`}
        >
          <PixelHeart className="w-3.5 h-3.5" />
          <span>Favorites</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            playToggle();
            setSoundEnabled(!soundEnabled);
          }}
          className="p-1.5 text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors"
          aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
        >
          {soundEnabled ? (
            <PixelSound className="w-4 h-4" />
          ) : (
            <PixelSoundOff className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  );
}
