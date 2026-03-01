"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PixelCalendar, PixelHeart, PixelSound, PixelSoundOff } from "./pixel-icons";
import { useSound } from "./providers/sound-provider";

const LOCATION = "Berlin, DE";
const TIMEZONE = "Europe/Berlin";

function formatBerlinTimeWithSeconds(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(date);
}

type NavbarProps = {
  /** When on homepage, show this as "N commits this week" (from GitHub). */
  commitCount?: number;
};

export function Navbar({ commitCount }: NavbarProps) {
  const pathname = usePathname();
  const { playClick, soundEnabled, setSoundEnabled, playToggle } = useSound();
  const isHome = pathname === "/";

  const handleSoundToggle = () => {
    playToggle();
    setSoundEnabled(!soundEnabled);
  };

  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const tick = () => setLiveTime(formatBerlinTimeWithSeconds(new Date()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = () => {
    playClick();
  };

  return (
    <header
      data-theme="editorial"
      className="w-full shrink-0 border-b border-[var(--editorial-border)] bg-[var(--editorial-bg)]/90 backdrop-blur-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center relative">
        {isHome ? (
          <>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--editorial-text-muted)] flex items-center">
              <span>{LOCATION}</span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-[var(--editorial-text-muted)]">
              <span className="hidden sm:inline" suppressHydrationWarning>
                {liveTime}
              </span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--editorial-text-muted)] flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--editorial-accent)] animate-pulse" />
                {typeof commitCount === "number"
                  ? `${commitCount} Commits this week`
                  : "0 Commits this week"}
              </span>
              <button
                type="button"
                onClick={handleSoundToggle}
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
        ) : (
          <>
            <Link
              href="/"
              onClick={handleNavClick}
              className="font-serif text-2xl font-medium tracking-tight text-[var(--editorial-text)] hover:text-[var(--editorial-accent)] transition-colors"
            >
              bhargav.dev
            </Link>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--editorial-text-muted)] flex items-center gap-6">
              <Link
                href="/"
                onClick={handleNavClick}
                className="hover:text-[var(--editorial-text)] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/blog"
                onClick={handleNavClick}
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
                onClick={handleNavClick}
                className={`flex items-center gap-2 ${pathname === "/streaks" ? "text-[var(--editorial-text)]" : "hover:text-[var(--editorial-text)] transition-colors"}`}
              >
                <PixelCalendar className="w-3.5 h-3.5" />
                <span>Streaks</span>
              </Link>
              <Link
                href="/favorites"
                onClick={handleNavClick}
                className={`flex items-center gap-2 ${pathname === "/favorites" ? "text-[var(--editorial-text)]" : "hover:text-[var(--editorial-text)] transition-colors"}`}
              >
                <PixelHeart className="w-3.5 h-3.5" />
                <span>Favorites</span>
              </Link>
              <button
                type="button"
                onClick={handleSoundToggle}
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
        )}
      </div>
    </header>
  );
}
