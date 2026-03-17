import type { PayloadWorkExperience } from "@/lib/data/cms";

type Props = {
  work: PayloadWorkExperience[];
};

export function ExperienceSection({ work }: Props) {
  if (!work || work.length === 0) return null;

  return (
    <section id="experience" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-xl">
        <h2 className="text-xs uppercase tracking-[0.35em] text-muted text-center mt-24 mb-10">
          Experience
        </h2>
        <div className="flex flex-col gap-12">
          {work.map((item) => (
            <article
              key={item.id}
              className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:gap-6 content-visibility-auto"
            >
              <div className="flex flex-col gap-2">
                {item.role ? (
                  <h3 className="text-base font-semibold text-primary">
                    {item.role}
                  </h3>
                ) : null}
                <div className="flex flex-col gap-1 text-sm text-muted">
                  <span>{item.company}</span>
                  {item.tech_stack ? <span>{item.tech_stack}</span> : null}
                </div>
                {item.bullets?.length ? (
                  <ul className="list-none pl-0 flex flex-col gap-1 text-base text-secondary">
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
              </div>
              {item.date_range ? (
                <div className="text-sm text-muted md:text-right">
                  {item.date_range}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
