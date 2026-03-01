"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PixelBook, PixelClose, PixelNote } from "./pixel-icons";
import { useSound } from "./providers/sound-provider";
import { formatWithWeekday } from "@/lib/format";

interface Book {
  id: string;
  title: string;
  author: string | null;
  total_pages: number | null;
  current_page: number;
  status: string;
}

interface ReadingNote {
  id: string;
  book_id: string;
  date: string;
  pages_read: number;
  notes: string | null;
  created_at: string;
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
    const supabase = createClient();
    const { data } = await supabase
      .from("reading_notes")
      .select("*")
      .eq("book_id", book.id)
      .order("date", { ascending: false });

    if (data) {
      setNotes(data);
    }
    setLoading(false);
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

  const progress = book?.total_pages
    ? Math.round((book.current_page / book.total_pages) * 100)
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
              <h2 className="text-lg font-serif font-semibold text-[var(--editorial-text)] mb-1">{book?.title}</h2>
              {book?.author && (
                <p className="text-sm text-[var(--editorial-text-muted)]">{book.author}</p>
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
          {book?.total_pages && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-[var(--editorial-text-muted)] mb-1">
                <span>progress</span>
                <span>
                  {book.current_page} / {book.total_pages} pages
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
            <p className="text-sm text-[var(--editorial-text-muted)]">Loading...</p>
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
                      {note.pages_read > 0 && (
                        <span className="text-xs text-[var(--editorial-accent)]">
                          +{note.pages_read} pages
                        </span>
                      )}
                    </div>

                    {isExpanded && note.notes && (
                      <p className="text-sm text-[var(--editorial-text)] mt-2 whitespace-pre-wrap">
                        {note.notes}
                      </p>
                    )}

                    {!isExpanded && note.notes && (
                      <p className="text-xs text-[var(--editorial-text-muted)] truncate">
                        {note.notes}
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
export function Reading({ label = "Reading", variant = "default" }: ReadingProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const { playClick } = useSound();

  useEffect(() => {
    fetchCurrentBook();
  }, []);

  const fetchCurrentBook = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("books")
      .select("*")
      .eq("status", "reading")
      .limit(1)
      .single();

    if (data) {
      setBook(data);
    }
  };

  const handleBookClick = () => {
    playClick();
    setJournalOpen(true);
  };

  if (variant === "aside") {
    const title = "The Alignment Problem";
    const author = "Brian Christian";
    const note =
      "Stepping back from the codebase to understand the long-term stakes of the models we deploy into production.";

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
            className="group cursor-default w-full text-left"
          >
            <h4 className="font-serif text-2xl leading-tight mb-1 text-[var(--editorial-text)] group-hover:text-[var(--editorial-accent)] transition-colors">
              {title}
            </h4>
            <p className="text-[10px] font-mono uppercase text-[var(--editorial-text-dim)] mb-3">
              {author}
            </p>
            <p className="text-xs font-serif italic text-[var(--editorial-text-muted)] leading-relaxed border-l-2 border-[var(--editorial-accent)] pl-3">
              &quot;{note}&quot;
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
            {book.total_pages && (
              <span className="text-xs text-[var(--editorial-text-dim)]">
                {Math.round((book.current_page / book.total_pages) * 100)}%
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
