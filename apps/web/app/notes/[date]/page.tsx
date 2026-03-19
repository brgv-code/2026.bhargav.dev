import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { DailyNotes } from "@/components/notes/daily-notes";

export const dynamic = "force-static";
export const dynamicParams = true;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(date: string): boolean {
  if (!DATE_REGEX.test(date)) return false;
  const d = new Date(date + "T12:00:00");
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(date);
}

type Props = {
  params: Promise<{ date: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  if (!isValidDateString(date)) return { title: "Notes" };
  return {
    title: `Notes · ${date}`,
    description: `Daily notes for ${date} — code, links, and learnings.`,
  };
}

export default async function NoteDatePage({ params }: Props) {
  const { date } = await params;

  if (!isValidDateString(date)) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <div
        data-theme="editorial"
        className="min-h-screen bg-[var(--editorial-bg)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 max-w-[1200px] mx-auto w-full px-6 md:px-8 pt-28 pb-24">
          <aside className="lg:col-span-4 flex flex-col min-h-0">
            <header className="lg:sticky lg:top-28">
              <p
                className="font-serif italic text-[17px] mb-3"
                style={{ color: "#1a1a1a" }}
              >
                a digital garden by
              </p>
              <h1
                className="font-serif text-4xl md:text-[2.8rem] leading-[1.15] mb-4"
                style={{ color: "#1a1a1a" }}
              >
                Bhargav
              </h1>
              <p
                className="text-[16px] leading-relaxed max-w-sm"
                style={{ color: "#1a1a1a" }}
              >
                Daily notes, code, references, and things I&apos;m learning —
                more like a working notebook than a polished blog.
              </p>
              <div
                className="mt-8 border-b border-dashed"
                style={{ borderColor: "rgba(26, 26, 26, 0.3)" }}
              />
            </header>
          </aside>
          <main className="lg:col-span-8 min-h-0 overflow-auto">
            <DailyNotes initialExpandDate={date} />
          </main>
        </div>
      </div>
    </>
  );
}
