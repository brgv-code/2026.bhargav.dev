import {
  PixelReact,
  PixelNext,
  PixelNode,
  PixelTypeScript,
  PixelPython,
  PixelTailwind,
  PixelCoolify,
} from "./pixel-icons";

const technologies = [
  { name: "React", icon: PixelReact },
  { name: "Next.js", icon: PixelNext },
  { name: "Node.js", icon: PixelNode },
  { name: "TypeScript", icon: PixelTypeScript },
  { name: "Coolify", icon: PixelCoolify },
  { name: "Tailwind", icon: PixelTailwind },
  { name: "Python", icon: PixelPython },
];

export function TechStack() {
  return (
    <section className="py-12">
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
        Stack
      </h2>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {technologies.map((tech) => {
          const Icon = tech.icon;
          return (
            <div
              key={tech.name}
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-default"
            >
              <Icon className="w-4 h-4 group-hover:text-icon-accent transition-colors" />
              <span>{tech.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
