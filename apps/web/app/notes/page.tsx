import type { Metadata } from "next";
import { DailyNotes } from "@/components/notes/daily-notes";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Daily notes, code snippets, links, and learnings — a digital garden of in-progress thoughts.",
};

export default function NotesPage() {
  return (
    <div className="px-12 pt-28 pb-24">
      <div className="flex items-baseline justify-between border-b border-border/15 pb-4 mb-12">
        <h1 className="font-serif text-3xl text-accent">Notes</h1>
      </div>
      <DailyNotes />
    </div>
  );
}
