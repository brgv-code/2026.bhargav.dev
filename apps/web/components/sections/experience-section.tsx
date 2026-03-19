import type { PayloadWorkExperience } from "@/lib/data/cms";

type Props = {
  work: PayloadWorkExperience[];
  resumeUrl?: string;
};

export function ExperienceSection({ work, resumeUrl = "/resume.pdf" }: Props) {
  if (!work || work.length === 0) return null;

  return (
    <section id="experience" aria-labelledby="experience-heading" className="scroll-mt-24 space-y-12">
      {/* Section header */}
      <div className="flex items-baseline justify-between border-b border-border/15 pb-4">
        <h2
          id="experience-heading"
          className="font-serif text-3xl text-accent"
        >
          Career Trajectory
        </h2>
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary uppercase tracking-widest hover:underline underline-offset-8"
        >
          Full Resume
        </a>
      </div>

      {/* Timeline */}
      <div
        className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-border/40"
      >
        <div className="flex flex-col gap-12">
          {work.map((item, index) => (
            <article
              key={item.id}
              className="relative content-visibility-auto"
            >
              {/* Timeline indicator */}
              <div
                className={`absolute -left-9 top-1.5 w-4 h-4 border-4 border-background ${
                  index === 0 ? "bg-accent" : "bg-border"
                }`}
                aria-hidden="true"
              />

              <div className="space-y-2">
                {item.date_range ? (
                  <span className="text-xs font-bold uppercase tracking-widest text-muted/70">
                    {item.date_range}
                  </span>
                ) : null}

                {item.role ? (
                  <h3 className="font-serif text-xl text-primary">
                    {item.role}
                    {item.company ? (
                      <>
                        <span className="text-secondary font-sans font-normal italic px-2">@</span>
                        {item.company}
                      </>
                    ) : null}
                  </h3>
                ) : null}

                {item.bullets?.length ? (
                  <ul className="list-none pl-0 flex flex-col gap-1 text-secondary leading-relaxed max-w-2xl">
                    {item.bullets.map((bullet) => (
                      <li key={bullet.id}>
                        {bullet.href ? (
                          <a
                            href={bullet.href}
                            target="_blank"
                            rel="noopener noreferrer"
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

                {item.tech_stack ? (
                  <p className="text-xs font-semibold text-muted/70">
                    {item.tech_stack
                      .split(",")
                      .map((t) => `#${t.trim()}`)
                      .join("  ")}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
