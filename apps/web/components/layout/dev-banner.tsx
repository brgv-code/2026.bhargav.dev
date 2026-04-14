"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

const WORDS = [
  "cooking",
  "building",
  "brewing",
  "compiling",
  "debugging",
  "shipping",
  "vibing",
  "caffeinating",
];

/** A little pixel character with arms that alternate to make it look like it's dancing */
function PixelDancer({ frame }: { frame: 0 | 1 }) {
  return (
    <svg
      viewBox="0 0 16 20"
      fill="currentColor"
      shapeRendering="crispEdges"
      className="w-3 h-4"
      aria-hidden="true"
    >
      {/* head */}
      <rect x="5" y="0" width="6" height="2" />
      <rect x="3" y="2" width="2" height="4" />
      <rect x="11" y="2" width="2" height="4" />
      <rect x="5" y="2" width="6" height="4" />
      {/* eyes */}
      <rect x="5" y="3" width="2" height="1" fill="var(--color-surface)" />
      <rect x="9" y="3" width="2" height="1" fill="var(--color-surface)" />
      {/* body */}
      <rect x="5" y="6" width="6" height="4" />
      {/* arms — alternate between up and down */}
      {frame === 0 ? (
        <>
          <rect x="2" y="6" width="3" height="2" />
          <rect x="11" y="6" width="3" height="2" />
        </>
      ) : (
        <>
          <rect x="2" y="8" width="3" height="2" />
          <rect x="11" y="8" width="3" height="2" />
        </>
      )}
      {/* legs */}
      <rect x="5" y="10" width="2" height="4" />
      <rect x="9" y="10" width="2" height="4" />
      {/* feet */}
      <rect x="3" y="14" width="4" height="2" />
      <rect x="9" y="14" width="4" height="2" />
    </svg>
  );
}

export function DevBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [frame, setFrame] = useState<0 | 1>(0);

  // cycle words with fade
  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % WORDS.length);
        setFade(true);
      }, 150);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // dance animation — flip frames
  useEffect(() => {
    const id = setInterval(() => {
      setFrame((f) => (f === 0 ? 1 : 0));
    }, 400);
    return () => clearInterval(id);
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center border-b px-4 py-1.5" style={{ background: "var(--banner-bg)", borderColor: "var(--banner-border)" }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <span style={{ color: "var(--banner-text)" }}>
          <PixelDancer frame={frame} />
        </span>
        <span className="font-mono text-xs" style={{ color: "var(--banner-text)" }}>
          still&nbsp;
          <span
            className="transition-opacity duration-150"
            style={{ opacity: fade ? 1 : 0 }}
          >
            {WORDS[wordIndex]}
          </span>
          <span className="animate-pulse">_</span>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        className="absolute right-4 text-muted hover:text-primary transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  );
}
