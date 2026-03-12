import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { fetchWorkExperience } from "@/lib/data/cms";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Work experience, roles, and projects I've worked on over the years.",
};

export default async function ExperiencePage() {
  const work = await fetchWorkExperience();

  return (
    <>
      <Navbar />
      <div
        data-theme="editorial"
        className="min-h-screen bg-[var(--editorial-bg)] flex flex-col"
      >
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-8 pt-28 pb-24">
          <header className="mb-12">
            <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--editorial-text-dim)] mb-4">
              work
            </p>
            <h1 className="font-serif text-4xl md:text-[3rem] text-[var(--editorial-text)] leading-[1.1] mb-3">
              Experience
            </h1>
            <p className="text-[var(--editorial-text-muted)] text-[15px] leading-relaxed max-w-md">
              A timeline of roles, responsibilities, and things I&apos;ve shipped.
            </p>
            <div className="mt-8 border-b border-dashed border-[var(--editorial-border)]" />
          </header>

          <section>
            {work.length === 0 ? (
              <p className="text-sm text-[var(--editorial-text-muted)]">
                No work experience added yet.
              </p>
            ) : (
              <div className="space-y-10">
                {work.map((exp) => (
                  <article
                    key={exp.id}
                    className="border-b border-dashed border-[var(--editorial-border)] pb-8"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h2 className="font-serif text-[1.4rem] text-[var(--editorial-text)] leading-snug">
                          {exp.role}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[12px] text-[var(--editorial-accent)] font-medium">
                            {exp.company}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-[var(--editorial-text-muted)] whitespace-nowrap shrink-0 pt-1">
                        {exp.date_range ?? "—"}
                      </span>
                    </div>

                    {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                      <ul className="flex flex-col gap-1.5 mt-3 list-none pl-0">
                        {exp.bullets.map((bullet, idx) => (
                          <li
                            key={bullet.id ?? `${exp.id}-b-${idx}`}
                            className="flex items-start gap-2 text-[13px] text-[var(--editorial-text-muted)] leading-relaxed"
                          >
                            <span className="text-[var(--editorial-accent)] mt-0.5 shrink-0">
                              —
                            </span>
                            {bullet.href ? (
                              <a
                                href={bullet.href}
                                className="underline-offset-2 hover:text-[var(--editorial-accent)] hover:underline"
                              >
                                {bullet.label}
                              </a>
                            ) : (
                              <span>{bullet.label}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {exp.contentHtml && (
                      <div
                        className="mt-3 text-[13px] leading-relaxed text-[var(--editorial-text-muted)] space-y-2"
                        dangerouslySetInnerHTML={{ __html: exp.contentHtml }}
                      />
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

