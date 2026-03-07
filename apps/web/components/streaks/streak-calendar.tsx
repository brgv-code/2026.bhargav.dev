"use client";

import { useMemo } from "react";

interface StreakCalendarProps {
  data: Record<string, number>;
  habitName: string;
}

export function StreakCalendar({ data, habitName }: StreakCalendarProps) {
  const { weeks, months } = useMemo(() => {
    const today = new Date();
    const weeksData: { date: Date; level: number }[][] = [];
    const monthsData: { name: string; col: number }[] = [];

    // Start from ~52 weeks ago on a Sunday
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentMonth = -1;
    let weekIndex = 0;

    for (let week = 0; week < 53; week++) {
      const weekDays: { date: Date; level: number }[] = [];

      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + week * 7 + day);

        const dateStr = date.toISOString().split("T")[0];
        const level = data[dateStr] || 0;

        weekDays.push({ date, level });

        // Track month changes
        if (date.getMonth() !== currentMonth && day === 0) {
          currentMonth = date.getMonth();
          monthsData.push({
            name: date.toLocaleString("default", { month: "short" }),
            col: weekIndex,
          });
        }
      }

      weeksData.push(weekDays);
      weekIndex++;
    }

    return { weeks: weeksData, months: monthsData };
  }, [data]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-[var(--streak-0)]";
      case 1:
        return "bg-[var(--streak-1)]";
      case 2:
        return "bg-[var(--streak-2)]";
      case 3:
        return "bg-[var(--streak-3)]";
      case 4:
        return "bg-[var(--streak-4)]";
      default:
        return "bg-[var(--streak-4)]";
    }
  };

  return (
    <div className="py-6 border-b border-[var(--editorial-border)]">
      <h3 className="font-mono text-[10px] tracking-widest uppercase text-[var(--editorial-text-dim)] mb-4">
        {habitName}
      </h3>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-1 ml-8 font-mono text-[10px] text-[var(--editorial-text-muted)]">
            {months.map((month, i) => (
              <div
                key={i}
                className="absolute"
                style={{ marginLeft: `${month.col * 12}px` }}
              >
                {month.name}
              </div>
            ))}
          </div>

          <div className="flex gap-1 mt-6">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2 font-mono text-[10px] text-[var(--editorial-text-muted)]">
              <span className="h-[10px]" />
              <span className="h-[10px] leading-[10px]">Mon</span>
              <span className="h-[10px]" />
              <span className="h-[10px] leading-[10px]">Wed</span>
              <span className="h-[10px]" />
              <span className="h-[10px] leading-[10px]">Fri</span>
              <span className="h-[10px]" />
            </div>

            {/* Calendar grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIdx) => {
                    const isToday =
                      day.date.toDateString() === new Date().toDateString();
                    const isFuture = day.date > new Date();

                    return (
                      <div
                        key={dayIdx}
                        className={`w-[10px] h-[10px] ${
                          isFuture
                            ? "bg-transparent border border-[var(--editorial-border)]"
                            : getLevelColor(day.level)
                        } ${isToday ? "ring-1 ring-[var(--editorial-accent)]" : ""}`}
                        title={`${day.date.toDateString()}: Level ${day.level}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 font-mono text-[10px] text-[var(--editorial-text-muted)]">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-[10px] h-[10px] ${getLevelColor(level)}`}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
