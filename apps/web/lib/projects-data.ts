export type ProjectStatus = "active" | "wip" | "archived";

export type ProjectItem = {
  name: string;
  title?: string; // display title (defaults to name)
  description: string;
  url: string;
  status?: ProjectStatus;
  year?: string;
  tech?: string[];
  github?: string;
};

export const projectsList: ProjectItem[] = [
  {
    name: "blog-sutra",
    description: "CMS with AI assistance for content workflows.",
    url: "#",
    status: "active",
    year: "2024",
    tech: ["Next.js", "Payload", "React"],
    github: "#",
  },
  {
    name: "sutramd",
    description: "Next-gen markdown editor with live preview.",
    url: "#",
    status: "wip",
    year: "2024",
    tech: ["TypeScript", "ProseMirror"],
    github: "#",
  },
  {
    name: "react-progress-bar",
    description: "Accessible React progress component with customizable styling.",
    url: "#",
    status: "active",
    year: "2023",
    tech: ["React", "CSS"],
    github: "#",
  },
];
