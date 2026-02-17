import { PixelArrow } from "./pixel-icons";

const projects = [
  {
    name: "blog-sutra",
    description: "CMS with AI assistance",
    url: "#",
  },
  {
    name: "sutramd",
    description: "Next Gen markdown editor",
    url: "#",
  },
  {
    name: "react-progress-bar",
    description: "React progress component",
    url: "#",
  },
];

export function Projects() {
  return (
    <section className="py-12">
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
        Projects
      </h2>

      <div className="space-y-4">
        {projects.map((project) => (
          <a
            key={project.name}
            href={project.url}
            className="group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-icon-accent" />
              <span className="text-sm font-medium text-foreground/90 group-hover:text-link transition-colors">
                {project.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {project.description}
              </span>
              <PixelArrow className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
