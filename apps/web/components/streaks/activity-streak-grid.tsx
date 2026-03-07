"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui";
import type { PayloadActivityDay } from "@/lib/data/cms";

function buildEmptyActivityGrid(): PayloadActivityDay[] {
  const days: PayloadActivityDay[] = [];
  const today = new Date();

  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    days.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      intensity: 0,
      summary: "No activity logged",
    });
  }

  return days;
}

type Props = {
  /** Activity from Payload (e.g. streaks). If empty, an empty 14-day grid is shown. */
  activityLog?: PayloadActivityDay[] | null;
};

export function ActivityStreakGrid({ activityLog }: Props) {
  const days = activityLog?.length ? activityLog : buildEmptyActivityGrid();
  const streak = activityLog?.length ?? 0;

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
              <span className="block text-[10px] opacity-70 mb-0.5">
                {day.date}
              </span>
              {day.summary}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
