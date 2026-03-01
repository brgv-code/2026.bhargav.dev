"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { StreakCalendar } from "@/components/streak-calendar";
import { WeeklyView } from "@/components/weekly-view";
import {
  PixelBook,
  PixelWorkout,
  PixelSteps,
  PixelFood,
  PixelSleep,
  PixelCode,
  PixelEdit,
} from "@/components/pixel-icons";

type ViewMode = "daily" | "weekly";

const habitConfig = [
  { key: "reading", name: "Reading 50 pages", icon: PixelBook },
  { key: "workout", name: "Workout", icon: PixelWorkout },
  { key: "steps", name: "10K Steps", icon: PixelSteps },
  { key: "eating", name: "Eating Goal", icon: PixelFood },
  { key: "sleep", name: "Sleep Score", icon: PixelSleep },
  { key: "coding", name: "Coding", icon: PixelCode },
  { key: "editing", name: "Editing/Motion Graphics", icon: PixelEdit },
];

function generateMockData() {
  const data: Record<string, Record<string, number>> = {};

  habitConfig.forEach((habit) => {
    data[habit.key] = {};
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Generate random completion levels with some patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Higher chance of completion on weekdays for work habits
      const baseChance = isWeekend ? 0.5 : 0.75;
      const random = Math.random();

      if (random < baseChance * 0.3) {
        data[habit.key][dateStr] = 4;
      } else if (random < baseChance * 0.5) {
        data[habit.key][dateStr] = 3;
      } else if (random < baseChance * 0.7) {
        data[habit.key][dateStr] = 2;
      } else if (random < baseChance * 0.85) {
        data[habit.key][dateStr] = 1;
      } else {
        data[habit.key][dateStr] = 0;
      }
    }
  });

  return data;
}

export default function StreaksPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [selectedHabit, setSelectedHabit] = useState<string>("all");

  const habitData = useMemo(() => generateMockData(), []);

  // Calculate total stats
  const stats = useMemo(() => {
    let totalCompleted = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();

    // Calculate based on all habits combined
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      let dayTotal = 0;
      habitConfig.forEach((habit) => {
        const value = habitData[habit.key]?.[dateStr] || 0;
        if (value >= 3) dayTotal++;
      });

      const percentComplete = (dayTotal / habitConfig.length) * 100;

      if (percentComplete >= 70) {
        totalCompleted++;
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        if (i === 0 || currentStreak === 0) {
          currentStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }

    if (currentStreak === 0) currentStreak = tempStreak;

    return { totalCompleted, currentStreak, longestStreak };
  }, [habitData]);

  return (
    <>
      <Navbar />
      <div data-theme="editorial" className="min-h-screen bg-[var(--editorial-bg)]">
        <main className="max-w-4xl mx-auto w-full px-6 md:px-8 pt-28 pb-24">
          <header className="mb-14">
            <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--editorial-text-dim)] mb-4">
              daily tracking
            </p>
            <h1 className="font-serif text-4xl md:text-[3.2rem] text-[var(--editorial-text)] leading-[1.1] mb-4">
              Habit Streaks
            </h1>
            <p className="text-[var(--editorial-text-muted)] text-[15px] leading-relaxed max-w-md">
              Building consistency one day at a time.
            </p>
            <div className="mt-8 border-b border-dashed border-[var(--editorial-border)]" />
          </header>

          {/* Stats Overview */}
          <section className="flex items-center gap-8 mb-10 text-sm">
            <div>
              <span className="text-[var(--editorial-text-muted)]">current </span>
              <span className="font-mono text-[var(--editorial-accent)]">{stats.currentStreak}d</span>
            </div>
            <div>
              <span className="text-[var(--editorial-text-muted)]">longest </span>
              <span className="font-mono text-[var(--editorial-text)]">{stats.longestStreak}d</span>
            </div>
            <div>
              <span className="text-[var(--editorial-text-muted)]">completed </span>
              <span className="font-mono text-[var(--editorial-text)]">{stats.totalCompleted}</span>
            </div>
          </section>

          {/* View Toggle */}
          <section className="flex items-center justify-between mb-10 border-b border-[var(--editorial-border)] pb-4">
            <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest">
              <button
                onClick={() => setViewMode("weekly")}
                className={`transition-colors ${
                  viewMode === "weekly"
                    ? "text-[var(--editorial-text)]"
                    : "text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)]"
                }`}
              >
                weekly
              </button>
              <button
                onClick={() => setViewMode("daily")}
                className={`transition-colors ${
                  viewMode === "daily"
                    ? "text-[var(--editorial-text)]"
                    : "text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)]"
                }`}
              >
                yearly
              </button>
            </div>

            {viewMode === "daily" && (
              <select
                value={selectedHabit}
                onChange={(e) => setSelectedHabit(e.target.value)}
                className="bg-transparent font-mono text-xs text-[var(--editorial-text-muted)] border-0 focus:ring-0 cursor-pointer uppercase tracking-widest"
              >
                <option value="all">all habits</option>
                {habitConfig.map((habit) => (
                  <option key={habit.key} value={habit.key}>
                    {habit.name.toLowerCase()}
                  </option>
                ))}
              </select>
            )}
          </section>

          {/* Main Content */}
          {viewMode === "weekly" ? (
            <WeeklyView habitData={habitData} />
          ) : (
            <div className="space-y-6">
              {selectedHabit === "all" ? (
                habitConfig.map((habit) => (
                  <StreakCalendar
                    key={habit.key}
                    data={habitData[habit.key]}
                    habitName={habit.name}
                  />
                ))
              ) : (
                <StreakCalendar
                  data={habitData[selectedHabit]}
                  habitName={
                    habitConfig.find((h) => h.key === selectedHabit)?.name ||
                    selectedHabit
                  }
                />
              )}
            </div>
          )}

          {/* Legend */}
          <section className="mt-14 pt-8 border-t border-[var(--editorial-border)]">
            <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--editorial-text-dim)] mb-4">
              tracking
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {habitConfig.map((habit) => {
                const Icon = habit.icon;
                return (
                  <div key={habit.key} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[var(--editorial-accent)]" />
                    <span className="text-xs text-[var(--editorial-text-muted)]">
                      {habit.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
