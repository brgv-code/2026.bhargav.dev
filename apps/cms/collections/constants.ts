import type { Access } from "payload";

export const slugs = {
  users: "users",
  posts: "posts",
  tags: "tags",
  series: "series",
  media: "media",
  workExperience: "work-experience",
  favorites: "favorites",
  streaks: "streaks",
  documents: "documents",
  notebooks: "notebooks",
} as const;
export type SlugValues = (typeof slugs)[keyof typeof slugs];

export const isLoggedIn: Access = ({ req: { user } }) => !!user;
