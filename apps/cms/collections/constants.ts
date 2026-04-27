import type { Access } from "payload";

export const slugs = {
  users: "users",
  posts: "posts",
  tags: "tags",
  series: "series",
  media: "media",
  projects: "projects",
  workExperience: "work-experience",
  favorites: "favorites",
  books: "books",
  readingNotes: "reading-notes",
  habitCompletions: "habit-completions",
  errorLogs: "error-logs",
  streaks: "streaks",
  documents: "documents",
  notebooks: "notebooks",
  education: "education",
  research: "research",
  community: "community",
  skills: "skills",
  languages: "languages",
} as const;
export type SlugValues = (typeof slugs)[keyof typeof slugs];

export const isLoggedIn: Access = ({ req: { user } }) => !!user;
