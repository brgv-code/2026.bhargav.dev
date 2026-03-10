"use client";

import { useState, useEffect } from "react";
import { PixelSound, PixelSoundOff } from "@/components/shared/pixel-icons";
import { useSound } from "@/components/providers/sound-provider";

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

type NavbarHomeStripProps = {
  contributionCount?: number;
};

export function NavbarHomeStrip({ contributionCount }: NavbarHomeStripProps) {
  const { soundEnabled, setSoundEnabled, playToggle } = useSound();
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const tick = () => setLiveTime(formatBerlinTimeWithSeconds(new Date()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
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
          {typeof contributionCount === "number"
            ? `${contributionCount} Contributions this week`
            : "0 Contributions this week"}
        </span>
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
