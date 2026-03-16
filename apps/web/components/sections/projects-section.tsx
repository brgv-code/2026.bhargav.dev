import type { PayloadProject } from "@/lib/data/cms";

type Props = {
  projects: PayloadProject[];
};

export function ProjectsSection({ projects }: Props) {
  if (!projects || projects.length === 0) return null;

  return (
    <section id="projects" className="scroll-mt-24">
      <h2 className="text-3xl font-bold tracking-tight text-primary mt-24 mb-10">
        Projects
      </h2>
      <div className="flex flex-col gap-8">
        {projects.map((project) => {
          const techLabels = Array.isArray(project.tech)
            ? project.tech
                .map((entry) => entry?.label)
                .filter((label): label is string => Boolean(label))
            : [];

          return (
            <article key={project.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline gap-3">
                <a
                  className="text-base font-medium text-primary"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.title ?? project.name}
                </a>
                {project.year ? (
                  <span className="text-base text-muted">{project.year}</span>
                ) : null}
              </div>
              <p className="text-base text-secondary">{project.description}</p>
              {techLabels.length ? (
                <p className="text-base text-muted">
                  Tech: {techLabels.join(", ")}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
