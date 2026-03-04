import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { DailyNotes } from "@/components/notes/daily-notes";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Daily notes, code snippets, links, and learnings — a digital garden of in-progress thoughts.",
};

export default function NotesPage() {
  return (
    <>
      <Navbar />
      <div data-theme="editorial" className="min-h-screen bg-[var(--editorial-bg)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 max-w-[1200px] mx-auto w-full px-6 md:px-8 pt-28 pb-24">
          <aside className="lg:col-span-4 flex flex-col min-h-0">
            <header className="lg:sticky lg:top-28">
              <p className="font-serif italic text-[17px] mb-3" style={{ color: "#1a1a1a" }}>
                a digital garden by
              </p>
              <h1 className="font-serif text-4xl md:text-[2.8rem] leading-[1.15] mb-4" style={{ color: "#1a1a1a" }}>
                Bhargav
              </h1>
              <p className="text-[16px] leading-relaxed max-w-sm" style={{ color: "#1a1a1a" }}>
                Daily notes, code, references, and things I&apos;m learning — more
                like a working notebook than a polished blog.
              </p>
              <div className="mt-8 border-b border-dashed" style={{ borderColor: "rgba(26, 26, 26, 0.3)" }} />
            </header>
          </aside>
          <main className="lg:col-span-8 min-h-0 overflow-auto">
            <DailyNotes />
          </main>
        </div>
      </div>
    </>
  );
}

