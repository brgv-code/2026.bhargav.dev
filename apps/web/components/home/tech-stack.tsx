import {
  PixelReact,
  PixelNext,
  PixelNode,
  PixelTypeScript,
  PixelPython,
  PixelTailwind,
  PixelCoolify,
} from "@/components/shared/pixel-icons";

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
    <section className="py-5">
      <h2 className="text-[var(--editorial-text-dim)] font-mono text-[10px] uppercase tracking-widest mb-3">
        Stack
      </h2>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {technologies.map((tech) => {
          const Icon = tech.icon;
          return (
            <div
              key={tech.name}
              className="group inline-flex items-center gap-2 text-sm text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] transition-colors cursor-default"
            >
              <Icon className="w-4 h-4 group-hover:text-[var(--editorial-accent)] transition-colors" />
              <span>{tech.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
