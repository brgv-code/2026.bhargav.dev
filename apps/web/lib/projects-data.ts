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
