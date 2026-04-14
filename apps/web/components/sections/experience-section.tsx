import Link from "next/link";
import type { PayloadWorkExperience } from "@/lib/data/cms";

type Props = {
  work: PayloadWorkExperience[];
  resumeUrl?: string;
  /** Show as compact sidebar panel (home page) vs full-width list (experience page) */
  variant?: "panel" | "full";
  compactHome?: boolean;
};

export function ExperienceSection({
  work,
  resumeUrl = "/resume.pdf",
  variant = "panel",
  compactHome = false,
}: Props) {
  if (!work || work.length === 0) return null;

  if (variant === "full") {
    return (
      <section
        id="experience"
        aria-labelledby="experience-heading"
        className="scroll-mt-8"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2
            id="experience-heading"
            className="text-2xs font-mono uppercase tracking-widest text-muted"
          >
            Experience
          </h2>
          {/* <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xs text-muted hover:text-primary transition-colors duration-normal"
          >
            Full Resume →
          </a> */}
        </div>

        <div className="flex flex-col">
          {work.map((item) => (
            <article key={item.id} className="px-6 py-5 border-b border-border">
              <div className="flex items-baseline justify-between gap-4 mb-1">
                <h3 className="text-sm font-semibold text-primary">
                  {item.role}
                </h3>
                {item.date_range ? (
                  <span className="text-xs text-muted shrink-0">
                    {item.date_range}
                  </span>
                ) : null}
              </div>
              {item.company ? (
                <p className="text-xs font-medium text-accent mb-2">
                  {item.company}
                </p>
              ) : null}
              {item.bullets?.length ? (
                <ul className="flex flex-col gap-1">
                  {item.bullets.map((bullet) => (
                    <li
                      key={bullet.id}
                      className="text-xs text-secondary leading-relaxed"
                    >
                      {bullet.href ? (
                        <a
                          href={bullet.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          {bullet.label}
                        </a>
                      ) : (
                        bullet.label
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  /* Panel variant — compact sidebar style for home page */
  return (
    <section aria-labelledby="experience-panel-heading">
      {/* Experience header */}
      <div
        className={`flex items-center justify-between px-5 py-4 ${
          compactHome ? "" : "border-b border-border"
        }`}
      >
        <h2
          id="experience-panel-heading"
          className="text-2xs font-mono uppercase tracking-widest text-muted"
        >
          Experience
        </h2>
        <Link
          href="/experience"
          className="text-2xs text-muted hover:text-primary transition-colors duration-normal"
        >
          View all →
        </Link>
      </div>

      {/* Experience entries */}
      {work.slice(0, 4).map((item) => (
        <article
          key={item.id}
          className={`px-5 py-0 ${compactHome ? "" : "border-b border-border"}`}
        >
          <div className={`${compactHome ? "border-b border-border/60 py-4" : "py-4"}`}>
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-primary leading-snug">
              {item.role}
            </h3>
            {item.date_range ? (
              <span className="text-2xs text-muted shrink-0">
                {item.date_range}
              </span>
            ) : null}
          </div>
          {item.company ? (
            <p className="text-xs font-medium text-accent mb-1.5">
              {item.company}
            </p>
          ) : null}
          {item.bullets?.[0] ? (
            <p className="text-xs text-secondary leading-relaxed line-clamp-2">
              {item.bullets[0].label}
            </p>
          ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
