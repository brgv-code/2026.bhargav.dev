import Link from "next/link";
import { ExternalLink, Code2 } from "lucide-react";
import type { PayloadProject } from "@/lib/data/cms";

type Props = {
  projects: PayloadProject[];
};

export function ProjectsSection({ projects }: Props) {
  if (!projects || projects.length === 0) return null;

  return (
    <section aria-labelledby="projects-heading">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2
          id="projects-heading"
          className="text-2xs font-mono uppercase tracking-widest text-muted"
        >
          Projects
        </h2>
        <Link
          href="/projects"
          className="text-2xs text-muted hover:text-primary transition-colors duration-normal"
        >
          View all →
        </Link>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-background p-px">
        {projects.map((project) => {
          const techLabels = Array.isArray(project.tech)
            ? project.tech
                .map((entry) => entry?.label)
                .filter((label): label is string => Boolean(label))
            : [];

          return (
            <article
              key={project.id}
              className="bg-surface p-5 flex flex-col gap-4"
            >
              {/* Card header row */}
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 bg-accent-subtle flex items-center justify-center">
                  <Code2
                    size={14}
                    className="text-accent"
                    aria-hidden="true"
                  />
                </div>
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.title ?? project.name} in new tab`}
                    className="text-muted hover:text-primary transition-colors duration-normal"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                ) : null}
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-1.5 flex-1">
                <h3 className="text-sm font-semibold text-primary leading-snug">
                  {project.title ?? project.name}
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Tech tags */}
              {techLabels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {techLabels.map((label) => (
                    <span
                      key={label}
                      className="px-1.5 py-0.5 text-2xs font-semibold bg-tag-bg text-tag-text"
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
