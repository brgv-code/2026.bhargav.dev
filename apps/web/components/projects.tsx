import { PixelArrow } from "./pixel-icons";
import { projectsList } from "@/lib/projects-data";

export function Projects() {
  return (
    <section className="py-5">
      <h2 className="text-[var(--editorial-text-dim)] font-mono text-[10px] uppercase tracking-widest mb-4">
        Projects
      </h2>

      <div className="space-y-0">
        {projectsList.map((project) => (
          <a
            key={project.name}
            href={project.url}
            className="group flex items-center justify-between gap-4 py-2 border-b border-dashed border-[var(--editorial-border)] last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-[var(--editorial-accent)]" />
              <span className="text-sm font-medium text-[var(--editorial-text)] group-hover:text-[var(--editorial-accent)] transition-colors">
                {project.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--editorial-text-muted)] hidden sm:inline">
                {project.description}
              </span>
              <PixelArrow className="w-3 h-3 text-[var(--editorial-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
