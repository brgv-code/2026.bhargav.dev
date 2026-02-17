"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PixelClose, PixelBook, PixelCheck } from "./pixel-icons";
import { useSound } from "./providers/sound-provider";

interface HabitNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitKey: string;
  habitName: string;
  date: string;
  onSave: () => void;
}

export function HabitNoteModal({
  isOpen,
  onClose,
  habitKey,
  habitName,
  date,
  onSave,
}: HabitNoteModalProps) {
  const [notes, setNotes] = useState("");
  const [pagesRead, setPagesRead] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const { playClick, playSuccess } = useSound();

  const isReading = habitKey === "reading";

  const handleSave = async () => {
    playClick();
    setSaving(true);
    const supabase = createClient();

    // Save habit completion
    await supabase.from("habit_completions").upsert(
      {
        habit_key: habitKey,
        date: date,
        completed: true,
        notes: isReading ? null : notes || null,
      },
      { onConflict: "habit_key,date" }
    );

    // If reading, also save to reading_notes
    if (isReading && (notes || pagesRead > 0)) {
      // Get current reading book
      const { data: book } = await supabase
        .from("books")
        .select("id, current_page")
        .eq("status", "reading")
        .limit(1)
        .single();

      if (book) {
        await supabase.from("reading_notes").insert({
          book_id: book.id,
          date: date,
          pages_read: pagesRead,
          notes: notes || null,
        });

        // Update book progress
        if (pagesRead > 0) {
          await supabase
            .from("books")
            .update({ current_page: book.current_page + pagesRead })
            .eq("id", book.id);
        }
      }
    }

    setSaving(false);
    playSuccess();
    setNotes("");
    setPagesRead(0);
    onSave();
    onClose();
  };

  const handleClose = () => {
    playClick();
    setNotes("");
    setPagesRead(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md mx-4 bg-card border border-border p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {isReading && <PixelBook className="w-4 h-4 text-icon-accent" />}
              {habitName}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <PixelClose className="w-4 h-4" />
          </button>
        </div>

        {/* Pages read (for reading habit) */}
        {isReading && (
          <div className="mb-4">
            <label className="text-xs text-muted-foreground block mb-2">
              pages read today
            </label>
            <input
              type="number"
              min="0"
              value={pagesRead}
              onChange={(e) => setPagesRead(Number(e.target.value))}
              className="w-full bg-secondary text-foreground px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-foreground"
              placeholder="0"
            />
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="text-xs text-muted-foreground block mb-2">
            {isReading ? "what did you read? (brief notes)" : "notes (optional)"}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 bg-secondary text-foreground px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-foreground resize-none"
            placeholder={
              isReading
                ? "Key insights, memorable quotes, thoughts..."
                : "Any notes for today..."
            }
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            <PixelCheck className="w-3.5 h-3.5" />
            <span>{saving ? "saving..." : "complete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
