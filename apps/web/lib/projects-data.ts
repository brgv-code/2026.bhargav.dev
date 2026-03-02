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
    name: "Portfolio 2026",
    description: "This website :)",
    url: "#",
    status: "wip",
    year: "2024",
    tech: ["Next.js", "Payload", "React"],
    github: "https://github.com/brgv-code/2026.bhargav.dev",
  },
  {
    name: "Onyx",
    description: "Photo sharing platform",
    url: "https://onyxgallery.me",
    status: "wip",
    year: "2024",
    tech: ["Next.js", "Payload", "React"],
  },
  {
    name: "sutramd",
    description: "Next-gen markdown editor with live preview.",
    url: "https://bhargav.dev/projects/sutramd",
    status: "wip",
    year: "2024",
    tech: ["TypeScript", "ProseMirror"],
    github: "https://github.com/brgv-code/sutramd",
  },
  {
    name: "react-progress-bar",
    description: "Accessible React progress component with customizable styling.",
    url: "https://loader.bhargav.dev/",
    status: "active",
    year: "2023",
    tech: ["React", "CSS"],
    github: "https://github.com/brgv-code/react-progress-bar",
  },
];
