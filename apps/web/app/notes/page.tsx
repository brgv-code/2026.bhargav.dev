import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { DailyNotes } from "@/components/notes/daily-notes";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Daily notes, code snippets, links, and learnings — a digital garden of in-progress thoughts.",
};

export default function NotesPage() {
  return (
    <>
      <Navbar />
      <div
        data-theme="editorial"
        className="min-h-screen bg-[var(--editorial-bg)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 max-w-[1200px] mx-auto w-full px-6 md:px-8 pt-28 pb-24">
          <aside className="lg:col-span-4 flex flex-col min-h-0">
          </aside>
          <main className="lg:col-span-8 min-h-0 overflow-auto">
            <DailyNotes />
          </main>
        </div>
      </div>
    </>
  );
}
