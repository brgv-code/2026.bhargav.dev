import type { PayloadProject } from "@/lib/data/cms";

type Props = {
  projects: PayloadProject[];
};

export function ProjectsSection({ projects }: Props) {
  if (!projects || projects.length === 0) return null;

  return (
    <section id="projects" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-xl">
        <h2 className="text-xs uppercase tracking-[0.35em] text-muted text-center mt-24 mb-10">
          Projects
        </h2>
        <div className="flex flex-col gap-12">
          {projects.map((project) => {
            const techLabels = Array.isArray(project.tech)
              ? project.tech
                  .map((entry) => entry?.label)
                  .filter((label): label is string => Boolean(label))
              : [];
            const statusLabel = project.status
              ? project.status.charAt(0).toUpperCase() + project.status.slice(1)
              : null;
            const metaParts = [
              project.year ?? "",
              statusLabel ?? "",
            ].filter(Boolean);

            return (
              <article
                key={project.id}
                className="flex flex-col gap-2 content-visibility-auto"
              >
                <a
                  className="text-base font-semibold text-primary"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.title ?? project.name}
                </a>
                {metaParts.length ? (
                  <p className="text-sm text-muted">{metaParts.join(" / ")}</p>
                ) : null}
                <p className="text-base text-secondary">
                  {project.description}
                </p>
                {techLabels.length ? (
                  <p className="text-sm text-muted">
                    Tech: {techLabels.join(", ")}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
