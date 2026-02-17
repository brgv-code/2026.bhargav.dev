"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PixelBook, PixelClose, PixelNote } from "./pixel-icons";
import { useSound } from "./providers/sound-provider";

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

  useEffect(() => {
    if (isOpen && book) {
      fetchNotes();
    }
  }, [isOpen, book]);

  const fetchNotes = async () => {
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
  };

  const handleNoteClick = (note: ReadingNote) => {
    playClick();
    setSelectedNote(selectedNote?.id === note.id ? null : note);
  };

  if (!isOpen) return null;

  const progress = book?.total_pages
    ? Math.round((book.current_page / book.total_pages) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="relative ml-auto w-full max-w-md bg-card border-l border-border h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                reading journal
              </p>
              <h2 className="text-lg font-bold mb-1">{book?.title}</h2>
              {book?.author && (
                <p className="text-sm text-muted-foreground">{book.author}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <PixelClose className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          {book?.total_pages && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>progress</span>
                <span>
                  {book.current_page} / {book.total_pages} pages
                </span>
              </div>
              <div className="h-2 bg-secondary">
                <div
                  className="h-full bg-foreground/60 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <PixelNote className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No reading notes yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Check the reading habit to add notes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => {
                const noteDate = new Date(note.date);
                const isExpanded = selectedNote?.id === note.id;

                return (
                  <button
                    key={note.id}
                    onClick={() => handleNoteClick(note)}
                    className={`w-full text-left p-3 border transition-colors ${
                      isExpanded
                        ? "border-foreground/30 bg-secondary/50"
                        : "border-border/50 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {noteDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {note.pages_read > 0 && (
                        <span className="text-xs text-icon-accent">
                          +{note.pages_read} pages
                        </span>
                      )}
                    </div>

                    {isExpanded && note.notes && (
                      <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">
                        {note.notes}
                      </p>
                    )}

                    {!isExpanded && note.notes && (
                      <p className="text-xs text-muted-foreground truncate">
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

// Reading section component for homepage that opens journal
export function Reading() {
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

  return (
    <>
      <section className="py-12">
        <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
          Reading
        </h2>

        {book ? (
          <button
            onClick={handleBookClick}
            className="flex items-center gap-3 group text-left"
          >
            <PixelBook className="w-4 h-4 text-icon-accent" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {book.title}
            </span>
            {book.total_pages && (
              <span className="text-xs text-muted-foreground/60">
                {Math.round((book.current_page / book.total_pages) * 100)}%
              </span>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <PixelBook className="w-4 h-4 text-icon-accent" />
            <span className="text-sm text-muted-foreground">
              The Almanack of Naval Ravikant
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
