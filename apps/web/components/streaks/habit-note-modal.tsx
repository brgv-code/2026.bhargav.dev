"use client";

import { useEffect, useState } from "react";
import {
  PixelClose,
  PixelBook,
  PixelCheck,
} from "@/components/shared/pixel-icons";
import { useSound } from "@/components/providers/sound-provider";
import { formatWithWeekday } from "@/lib/format";

interface HabitNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitKey: string;
  habitName: string;
  date: string;
  onSave: () => void;
}

type CurrentBook = {
  id: number;
  title: string;
  currentPage?: number | null;
};

export function HabitNoteModal({
  isOpen,
  onClose,
  habitKey,
  habitName,
  date,
  onSave,
}: HabitNoteModalProps) {
  const [notes, setNotes] = useState("");
  const [pageStart, setPageStart] = useState<number>(1);
  const [pageEnd, setPageEnd] = useState<number>(1);
  const [book, setBook] = useState<CurrentBook | null>(null);
  const [saving, setSaving] = useState(false);
  const { playClick, playSuccess } = useSound();

  const isReading = habitKey === "reading";
  const pagesRead = Math.max(0, pageEnd - pageStart + 1);

  useEffect(() => {
    if (!isOpen || !isReading) return;

    const loadCurrentBook = async () => {
      const res = await fetch("/api/books/current", { cache: "no-store" });
      const data = res.ok ? await res.json() : null;
      if (!data || typeof data !== "object") {
        setBook(null);
        setPageStart(1);
        setPageEnd(1);
        return;
      }

      const currentBook = data as CurrentBook;
      const nextPage = Math.max(1, (currentBook.currentPage ?? 0) + 1);
      setBook(currentBook);
      setPageStart(nextPage);
      setPageEnd(nextPage);
    };

    void loadCurrentBook();
  }, [isOpen, isReading]);

  const handleSave = async () => {
    playClick();
    setSaving(true);

    const payload = {
      habitKey,
      date,
      completed: true,
      value: isReading ? pagesRead : 1,
      notes: isReading ? null : notes || null,
      reading: isReading
        ? {
            pageStart: Math.max(1, Math.min(pageStart, pageEnd)),
            pageEnd: Math.max(1, Math.max(pageStart, pageEnd)),
            thoughts: notes || null,
            bookId: book?.id,
          }
        : undefined,
    };

    const res = await fetch("/api/habit-completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[habit-note-modal] failed to save completion", detail);
      setSaving(false);
      return;
    }

    setSaving(false);
    playSuccess();
    setNotes("");
    setPageStart(1);
    setPageEnd(1);
    onSave();
    onClose();
  };

  const handleClose = () => {
    playClick();
    setNotes("");
    setPageStart(1);
    setPageEnd(1);
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
              {formatWithWeekday(date, true)}
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
          <div className="mb-4 space-y-3">
            <label className="text-xs text-muted-foreground block">
              page range read today
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="1"
                value={pageStart}
                onChange={(e) => setPageStart(Number(e.target.value))}
                className="w-full bg-secondary text-foreground px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-foreground"
                placeholder="from"
              />
              <input
                type="number"
                min="1"
                value={pageEnd}
                onChange={(e) => setPageEnd(Number(e.target.value))}
                className="w-full bg-secondary text-foreground px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-foreground"
                placeholder="to"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {book
                ? `${book.title}: +${pagesRead} page${pagesRead === 1 ? "" : "s"}`
                : `+${pagesRead} page${pagesRead === 1 ? "" : "s"} logged`}
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="text-xs text-muted-foreground block mb-2">
            {isReading
              ? "what did you read? (brief notes)"
              : "notes (optional)"}
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
