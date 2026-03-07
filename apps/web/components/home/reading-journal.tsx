"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PixelBook,
  PixelClose,
  PixelNote,
} from "@/components/shared/pixel-icons";
import { useSound } from "@/components/providers/sound-provider";
import { formatWithWeekday } from "@/lib/format";

interface Book {
  id: number;
  title: string;
  author: string | null;
  totalPages: number | null;
  currentPage: number | null;
  status: string | null;
  latestThought?: string | null;
}

interface ReadingNote {
  id: number;
  date: string;
  pageStart: number;
  pageEnd: number;
  pagesRead: number | null;
  thoughts: string | null;
  createdAt?: string;
}

interface ReadingJournalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export function ReadingJournal({ isOpen, onClose, book }: ReadingJournalProps) {
  const [notes, setNotes] = useState<ReadingNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<ReadingNote | null>(null);
  const [loading, setLoading] = useState(false);
  const { playClick } = useSound();

  const fetchNotes = useCallback(async () => {
    if (!book) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reading-notes?bookId=${book.id}`, {
        cache: "no-store",
      });
      const data = res.ok ? await res.json() : [];
      if (Array.isArray(data)) {
        setNotes(
          data.map((note: ReadingNote) => ({
            ...note,
            thoughts: note.thoughts ?? null,
            pagesRead:
              typeof note.pagesRead === "number"
                ? note.pagesRead
                : Math.max(0, note.pageEnd - note.pageStart + 1),
          })),
        );
      } else {
        setNotes([]);
      }
    } finally {
      setLoading(false);
    }
  }, [book]);

  useEffect(() => {
    if (isOpen && book) {
      fetchNotes();
    }
  }, [isOpen, book, fetchNotes]);

  const handleNoteClick = (note: ReadingNote) => {
    playClick();
    setSelectedNote(selectedNote?.id === note.id ? null : note);
  };

  if (!isOpen) return null;

  const progress = book?.totalPages
    ? Math.round(((book.currentPage ?? 0) / book.totalPages) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex" data-theme="editorial">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--editorial-bg)]/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="relative ml-auto w-full max-w-md bg-[var(--editorial-surface)] border-l border-[var(--editorial-border)] h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[var(--editorial-border)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[var(--editorial-text-dim)] font-mono text-[11px] uppercase tracking-widest mb-2">
                reading journal
              </p>
              <h2 className="text-lg font-serif font-semibold text-[var(--editorial-text)] mb-1">
                {book?.title}
              </h2>
              {book?.author && (
                <p className="text-sm text-[var(--editorial-text-muted)]">
                  {book.author}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors"
            >
              <PixelClose className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          {book?.totalPages && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-[var(--editorial-text-muted)] mb-1">
                <span>progress</span>
                <span>
                  {book.currentPage ?? 0} / {book.totalPages} pages
                </span>
              </div>
              <div className="h-2 bg-[var(--editorial-surface2)]">
                <div
                  className="h-full bg-[var(--editorial-accent)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-sm text-[var(--editorial-text-muted)]">
              Loading...
            </p>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <PixelNote className="w-8 h-8 text-[var(--editorial-text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--editorial-text-muted)]">
                No reading notes yet
              </p>
              <p className="text-xs text-[var(--editorial-text-dim)] mt-1">
                Check the reading habit to add notes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => {
                const isExpanded = selectedNote?.id === note.id;

                return (
                  <button
                    key={note.id}
                    onClick={() => handleNoteClick(note)}
                    className={`w-full text-left p-3 border transition-colors ${
                      isExpanded
                        ? "border-[var(--editorial-accent)] bg-[var(--editorial-surface2)]"
                        : "border-[var(--editorial-border)] hover:border-[var(--editorial-accent)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--editorial-text-muted)]">
                        {formatWithWeekday(note.date, false)}
                      </span>
                      {(note.pagesRead ?? 0) > 0 && (
                        <span className="text-xs text-[var(--editorial-accent)]">
                          p.{note.pageStart}-{note.pageEnd}
                        </span>
                      )}
                    </div>

                    {isExpanded && note.thoughts && (
                      <p className="text-sm text-[var(--editorial-text)] mt-2 whitespace-pre-wrap">
                        {note.thoughts}
                      </p>
                    )}

                    {!isExpanded && note.thoughts && (
                      <p className="text-xs text-[var(--editorial-text-muted)] truncate">
                        {note.thoughts}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type ReadingProps = {
  /** Section heading when not in aside (e.g. "Reading") */
  label?: string;
  /** "aside" = template style (Currently Reading block with serif title, author) */
  variant?: "default" | "aside";
};

// Reading section component for homepage that opens journal
export function Reading({
  label = "Reading",
  variant = "default",
}: ReadingProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [journalOpen, setJournalOpen] = useState(false);
  const { playClick } = useSound();

  useEffect(() => {
    void fetchCurrentBook();
  }, []);

  const fetchCurrentBook = async (): Promise<void> => {
    try {
      const res = await fetch("/api/books/current", { cache: "no-store" });
      const data = res.ok ? await res.json() : null;
      setBook(data && typeof data === "object" ? (data as Book) : null);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = () => {
    if (!book) return;
    playClick();
    setJournalOpen(true);
  };

  if (variant === "aside") {
    return (
      <>
        <div className="border-t border-[var(--editorial-border)] pt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--editorial-text-dim)]">
              {label}
            </span>
          </div>
          <button
            type="button"
            onClick={handleBookClick}
            className="group w-full text-left disabled:cursor-default"
            disabled={!book}
          >
            <h4 className="font-serif text-2xl leading-tight mb-1 text-[var(--editorial-text)] group-hover:text-[var(--editorial-accent)] transition-colors">
              {book?.title ?? (loading ? "Loading..." : "No current book")}
            </h4>
            <p className="text-[10px] font-mono uppercase text-[var(--editorial-text-dim)] mb-3">
              {book?.author ?? "Add a reading book in CMS"}
            </p>
            <p className="text-xs font-serif italic text-[var(--editorial-text-muted)] leading-relaxed border-l-2 border-[var(--editorial-accent)] pl-3">
              &quot;
              {book?.latestThought ??
                "Open the reading habit and log today’s page range and notes to see it here."}
              &quot;
            </p>
          </button>
        </div>
        <ReadingJournal
          isOpen={journalOpen}
          onClose={() => setJournalOpen(false)}
          book={book}
        />
      </>
    );
  }

  return (
    <>
      <section className="py-0">
        <h2 className="text-[var(--editorial-text-dim)] font-mono text-[10px] uppercase tracking-widest mb-3">
          {label}
        </h2>

        {book ? (
          <button
            onClick={handleBookClick}
            className="flex items-center gap-3 group text-left"
          >
            <PixelBook className="w-4 h-4 text-[var(--editorial-accent)]" />
            <span className="text-sm text-[var(--editorial-text-muted)] group-hover:text-[var(--editorial-text)] transition-colors">
              {book.title}
            </span>
            {book.totalPages && (
              <span className="text-xs text-[var(--editorial-text-dim)]">
                {Math.round(((book.currentPage ?? 0) / book.totalPages) * 100)}%
              </span>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <PixelBook className="w-4 h-4 text-[var(--editorial-text-dim)]" />
            <span className="text-sm text-[var(--editorial-text-muted)]">
              No book in progress
            </span>
          </div>
        )}
      </section>

      <ReadingJournal
        isOpen={journalOpen}
        onClose={() => setJournalOpen(false)}
        book={book}
      />
    </>
  );
}
