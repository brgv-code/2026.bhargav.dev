"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PayloadActivityDay } from "@/lib/payload";

/** Fallback activity when no payload data is available. */
const FALLBACK_ACTIVITY: PayloadActivityDay[] = [
  { date: "Feb 15", intensity: 0.15, summary: "Minor CSS tweaks on blog layout" },
  { date: "Feb 16", intensity: 0.25, summary: "Reviewed PR for auth module" },
  { date: "Feb 17", intensity: 0.4, summary: "Wrote draft: ESM/CJS conflicts" },
  { date: "Feb 18", intensity: 0.6, summary: "Refactored component library tokens" },
  { date: "Feb 19", intensity: 0.25, summary: "Code review & standup notes" },
  { date: "Feb 20", intensity: 0.8, summary: "Published Payload v3 + Next.js post" },
  { date: "Feb 21", intensity: 0.15, summary: "Light reading & bookmarking" },
  { date: "Feb 22", intensity: 0.3, summary: "Bug fix: sidebar scroll on mobile" },
  { date: "Feb 23", intensity: 0.5, summary: "Built activity log component" },
  { date: "Feb 24", intensity: 0.9, summary: "Major refactor: design system tokens" },
  { date: "Feb 25", intensity: 0.4, summary: "Pair programming session on API layer" },
  { date: "Feb 26", intensity: 0.7, summary: "Migrated 3 components to new tokens" },
  { date: "Feb 27", intensity: 0.2, summary: "Documentation & README updates" },
  { date: "Feb 28", intensity: 1.0, summary: "Shipped portfolio redesign v2 🚀" },
];

type Props = {
  /** Activity from Payload (e.g. streaks). If empty or undefined, fallback data is used. */
  activityLog?: PayloadActivityDay[] | null;
};

export function ActivityStreakGrid({ activityLog }: Props) {
  const days = activityLog?.length
    ? activityLog
    : FALLBACK_ACTIVITY;
  const streak = days.length;

  return (
    <div className="border-t border-[var(--editorial-border)] pt-8">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--editorial-text-dim)]">
          Activity Log
        </span>
        <span className="font-mono text-[11px] text-[var(--editorial-accent)] font-medium">
          {streak} day streak
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 w-full max-w-[220px]">
        {days.map((day, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div
                className="aspect-square rounded-[2px] cursor-pointer transition-transform duration-150 ease-out hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--editorial-bg)]"
                style={{
                  backgroundColor:
                    i === days.length - 1
                      ? "var(--editorial-accent)"
                      : `color-mix(in srgb, var(--editorial-text) ${Math.max(8, day.intensity * 70)}%, transparent)`,
                }}
              />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="font-mono text-[11px] px-3 py-2 max-w-[200px] rounded-sm border-0 shadow-md"
              style={{
                backgroundColor: "#232220",
                color: "#f7f5f0",
              }}
            >
              <span className="block text-[10px] opacity-70 mb-0.5">{day.date}</span>
              {day.summary}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
