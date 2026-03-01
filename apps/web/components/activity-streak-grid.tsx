"use client";

/** Hardcoded activity for a single day in the streak grid. */
type DayActivity = {
  /** 0 = empty, 1–4 = light to dark fill */
  intensity: 0 | 1 | 2 | 3 | 4;
  /** If true, show current-day ring and ping dot */
  isToday?: boolean;
  /** Optional peek content on hover */
  peek?: {
    dateLabel: string;
    tag: string;
    /** Primary activity (e.g. WRITE = filled badge) */
    tagPrimary?: boolean;
    description: string;
  };
};

const INTENSITY_CLASSES = [
  "bg-[var(--editorial-text)]/5",
  "bg-[var(--editorial-text)]/20",
  "bg-[var(--editorial-text)]/40",
  "bg-[var(--editorial-text)]/60",
  "bg-[var(--editorial-text)]/80",
] as const;

/** Hardcoded 14-day activity for the homepage streak grid. */
const HARDCODED_DAYS: DayActivity[] = [
  { intensity: 0 },
  { intensity: 0 },
  {
    intensity: 2,
    peek: {
      dateLabel: "Feb 20",
      tag: "CODE",
      description: "Refactored the Next.js router state machine.",
    },
  },
  { intensity: 1 },
  { intensity: 3 },
  { intensity: 0 },
  { intensity: 1 },
  { intensity: 1 },
  { intensity: 2 },
  {
    intensity: 4,
    peek: {
      dateLabel: "Feb 24",
      tag: "WRITE",
      tagPrimary: true,
      description: 'Published "Type-Safe Prompts in Production"',
    },
  },
  { intensity: 1 },
  { intensity: 2 },
  { intensity: 1 },
  {
    intensity: 2,
    isToday: true,
    peek: {
      dateLabel: "Today",
      tag: "CODE",
      description: "Merged caching layer into Cognitive.ts",
    },
  },
];

export function ActivityStreakGrid() {
  return (
    <div className="border-t border-[var(--editorial-border)] pt-8">
      <div className="flex justify-between items-baseline mb-4">
        <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--editorial-text-dim)]">
          Activity Log
        </span>
        <span className="font-mono text-[9px] text-[var(--editorial-accent)] uppercase tracking-widest">
          14 Day Streak
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 w-full max-w-[220px]">
        {HARDCODED_DAYS.map((day, i) => {
          const hasPeek = day.peek != null;
          const intensityClass = day.isToday
            ? "bg-[var(--editorial-accent)]"
            : INTENSITY_CLASSES[day.intensity];

          return (
            <div
              key={i}
              className={`
                relative w-full aspect-square rounded-sm transition-all
                ${intensityClass}
                ${day.isToday ? "ring-1 ring-offset-1 ring-offset-[var(--editorial-bg)] ring-[var(--editorial-accent)]" : ""}
                ${hasPeek ? "cursor-crosshair hover:ring-1 hover:ring-[var(--editorial-text)] hover:ring-offset-1 hover:ring-offset-[var(--editorial-bg)]" : ""}
                group
              `}
            >
              {day.isToday && (
                <span
                  className="absolute -bottom-1 -right-1 flex h-2 w-2"
                  aria-hidden
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--editorial-accent)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--editorial-accent)] border-2 border-[var(--editorial-bg)]" />
                </span>
              )}

              {hasPeek && day.peek && (
                <div
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-[var(--editorial-bg)] border border-[var(--editorial-border)] shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 translate-y-2 group-hover:translate-y-0"
                  role="tooltip"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span
                      className={`font-mono text-[9px] uppercase ${day.isToday ? "text-[var(--editorial-accent)] font-bold" : "text-[var(--editorial-text-muted)]"}`}
                    >
                      {day.peek.dateLabel}
                    </span>
                    <span
                      className={`font-mono text-[8px] px-1 py-0.5 rounded-sm ${day.peek.tagPrimary ? "bg-[var(--editorial-text)] text-[var(--editorial-bg)]" : "border border-[var(--editorial-border)]"}`}
                    >
                      {day.peek.tag}
                    </span>
                  </div>
                  <p className="font-serif text-sm leading-snug text-[var(--editorial-text)]">
                    {day.peek.description}
                  </p>
                  <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--editorial-bg)] border-b border-r border-[var(--editorial-border)] rotate-45"
                    aria-hidden
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
