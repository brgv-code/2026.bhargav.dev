"use client";

import { useMemo, useState } from "react";
import {
  PixelBook,
  PixelWorkout,
  PixelSteps,
  PixelFood,
  PixelSleep,
  PixelCode,
  PixelEdit,
} from "./pixel-icons";
import { HabitNoteModal } from "./habit-note-modal";
import { useSound } from "./providers/sound-provider";

interface WeeklyViewProps {
  habitData: Record<string, Record<string, number>>;
  onDataUpdate?: () => void;
}

const habits = [
  { key: "reading", name: "Reading 50 pages", icon: PixelBook, target: 50 },
  { key: "workout", name: "Workout", icon: PixelWorkout, target: 1 },
  { key: "steps", name: "10K Steps", icon: PixelSteps, target: 10000 },
  { key: "eating", name: "Eating Goal", icon: PixelFood, target: 1 },
  { key: "sleep", name: "Sleep Score", icon: PixelSleep, target: 85 },
  { key: "coding", name: "Coding", icon: PixelCode, target: 1 },
  { key: "editing", name: "Editing/Motion", icon: PixelEdit, target: 1 },
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyView({ habitData, onDataUpdate }: WeeklyViewProps) {
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    habitKey: string;
    habitName: string;
    date: string;
  }>({
    isOpen: false,
    habitKey: "",
    habitName: "",
    date: "",
  });

  const { playClick } = useSound();

  const weekDates = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, []);

  const getCompletionLevel = (value: number, target: number) => {
    if (value === 0) return 0;
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 4;
    if (percentage >= 75) return 3;
    if (percentage >= 50) return 2;
    if (percentage >= 25) return 1;
    return 0;
  };

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
        return "bg-[var(--streak-0)]";
    }
  };

  const handleCellClick = (
    habit: (typeof habits)[0],
    date: Date,
    isFuture: boolean,
    isCompleted: boolean
  ) => {
    if (isFuture) return;
    
    playClick();
    
    // If reading habit or not completed, show modal for notes
    if (habit.key === "reading" || !isCompleted) {
      setNoteModal({
        isOpen: true,
        habitKey: habit.key,
        habitName: habit.name,
        date: date.toISOString().split("T")[0],
      });
    }
  };

  const handleNoteSave = () => {
    if (onDataUpdate) {
      onDataUpdate();
    }
  };

  return (
    <>
      <div>
        <p className="text-xs text-muted-foreground mb-4">this week</p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left text-xs text-muted-foreground font-normal pb-4 pr-4">
                  Habit
                </th>
                {weekDates.map((date, i) => {
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  return (
                    <th
                      key={i}
                      className={`text-center text-xs font-normal pb-4 w-16 ${
                        isToday ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <div>{dayNames[date.getDay()]}</div>
                      <div className="text-[10px]">{date.getDate()}</div>
                    </th>
                  );
                })}
                <th className="text-center text-xs text-muted-foreground font-normal pb-4 pl-4">
                  Streak
                </th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => {
                const Icon = habit.icon;
                let streak = 0;

                // Calculate streak
                const today = new Date();
                for (let i = 0; i < 365; i++) {
                  const checkDate = new Date(today);
                  checkDate.setDate(today.getDate() - i);
                  const dateStr = checkDate.toISOString().split("T")[0];
                  const value = habitData[habit.key]?.[dateStr] || 0;
                  if (
                    getCompletionLevel(value, habit.target) >= 3 ||
                    value >= habit.target
                  ) {
                    streak++;
                  } else if (i > 0) {
                    break;
                  }
                }

                return (
                  <tr key={habit.key} className="border-t border-border/50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-icon-accent" />
                        <span className="text-xs text-foreground/80">
                          {habit.name}
                        </span>
                      </div>
                    </td>
                    {weekDates.map((date, i) => {
                      const dateStr = date.toISOString().split("T")[0];
                      const value = habitData[habit.key]?.[dateStr] || 0;
                      const level = getCompletionLevel(value, habit.target);
                      const isToday =
                        date.toDateString() === new Date().toDateString();
                      const isFuture = date > new Date();
                      const isCompleted = level >= 3;

                      return (
                        <td key={i} className="py-3">
                          <div className="flex justify-center">
                            <button
                              onClick={() =>
                                handleCellClick(habit, date, isFuture, isCompleted)
                              }
                              disabled={isFuture}
                              className={`w-8 h-8 transition-all ${
                                isFuture
                                  ? "border border-border/30 cursor-not-allowed"
                                  : `${getLevelColor(level)} hover:ring-1 hover:ring-foreground/50 cursor-pointer`
                              } ${isToday ? "ring-1 ring-foreground" : ""}`}
                              title={`${date.toDateString()}: ${isCompleted ? "Completed" : "Click to complete"}`}
                            />
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-3 pl-4">
                      <div className="flex justify-center">
                        <span className="text-xs font-mono text-muted-foreground">
                          {streak}d
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <HabitNoteModal
        isOpen={noteModal.isOpen}
        onClose={() =>
          setNoteModal({ isOpen: false, habitKey: "", habitName: "", date: "" })
        }
        habitKey={noteModal.habitKey}
        habitName={noteModal.habitName}
        date={noteModal.date}
        onSave={handleNoteSave}
      />
    </>
  );
}
