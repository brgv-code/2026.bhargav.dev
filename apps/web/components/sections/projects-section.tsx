import { ExternalLink, Code2 } from "lucide-react";
import type { PayloadProject } from "@/lib/data/cms";

type Props = {
  projects: PayloadProject[];
};

export function ProjectsSection({ projects }: Props) {
  if (!projects || projects.length === 0) return null;

  return (
    <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-24 space-y-12">
      {/* Section header */}
      <div className="flex items-baseline justify-between border-b border-border/15 pb-4">
        <h2
          id="projects-heading"
          className="font-serif text-3xl text-accent"
        >
          Technical Work
        </h2>
        <span className="text-sm text-muted italic">Selected Open Source</span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => {
          const techLabels = Array.isArray(project.tech)
            ? project.tech
                .map((entry) => entry?.label)
                .filter((label): label is string => Boolean(label))
            : [];

          return (
            <article
              key={project.id}
              className="bg-surface p-8 space-y-6 transition-colors hover:bg-highlight content-visibility-auto"
            >
              {/* Card header */}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-accent flex items-center justify-center">
                  <Code2
                    size={20}
                    className="text-accent-foreground"
                    aria-hidden="true"
                  />
                </div>
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.title ?? project.name} in new tab`}
                    className="text-muted hover:text-primary transition-colors"
                  >
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                ) : null}
              </div>

              {/* Card body */}
              <div className="space-y-3">
                <h3 className="font-serif text-xl text-primary">
                  {project.title ?? project.name}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Tech tags */}
              {techLabels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {techLabels.map((label) => (
                    <span
                      key={label}
                      className="px-2 py-1 text-[10px] uppercase font-bold tracking-tight bg-tag-bg text-tag-text"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
