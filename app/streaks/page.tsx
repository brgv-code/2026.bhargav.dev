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

// Generate mock data for demonstration
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
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-8">
        <section className="mb-12">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
            daily tracking
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Habit Streaks</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Building consistency one day at a time.
          </p>
        </section>

        {/* Stats Overview */}
        <section className="flex items-center gap-8 mb-10 text-sm">
          <div>
            <span className="text-muted-foreground">current </span>
            <span className="font-mono text-highlight">{stats.currentStreak}d</span>
          </div>
          <div>
            <span className="text-muted-foreground">longest </span>
            <span className="font-mono">{stats.longestStreak}d</span>
          </div>
          <div>
            <span className="text-muted-foreground">completed </span>
            <span className="font-mono">{stats.totalCompleted}</span>
          </div>
        </section>

        {/* View Toggle */}
        <section className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setViewMode("weekly")}
              className={`transition-colors ${
                viewMode === "weekly"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              weekly
            </button>
            <button
              onClick={() => setViewMode("daily")}
              className={`transition-colors ${
                viewMode === "daily"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              yearly
            </button>
          </div>

          {viewMode === "daily" && (
            <select
              value={selectedHabit}
              onChange={(e) => setSelectedHabit(e.target.value)}
              className="bg-transparent text-sm text-muted-foreground border-0 focus:ring-0 cursor-pointer"
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
        <section className="mt-10 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
            tracking
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {habitConfig.map((habit) => {
              const Icon = habit.icon;
              return (
                <div key={habit.key} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-icon-accent" />
                  <span className="text-xs text-muted-foreground">
                    {habit.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
