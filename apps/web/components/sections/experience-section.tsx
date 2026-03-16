import type { PayloadWorkExperience } from "@/lib/data/cms";

type Props = {
  work: PayloadWorkExperience[];
};

export function ExperienceSection({ work }: Props) {
  if (!work || work.length === 0) return null;

  return (
    <section id="experience" className="scroll-mt-24">
      <h2 className="text-3xl font-bold tracking-tight text-primary mt-24 mb-10">
        Experience
      </h2>
      <div className="flex flex-col gap-8">
        {work.map((item) => (
          <article key={item.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-base font-medium text-primary">
                {item.company}
              </span>
              {item.role ? (
                <span className="text-base text-secondary">{item.role}</span>
              ) : null}
              {item.date_range ? (
                <span className="text-base text-muted">
                  {item.date_range}
                </span>
              ) : null}
            </div>
            {item.bullets?.length ? (
              <ul className="list-disc pl-5 text-base text-secondary">
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
          </article>
        ))}
      </div>
    </section>
  );
}
