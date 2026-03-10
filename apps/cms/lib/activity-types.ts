/**
 * Types for activity aggregation. Dates are YYYY-MM-DD (Europe/Berlin day).
 */

export type ActivitySources = {
  githubCommits: number;
  blogsPublished: number;
  notesCreated: number;
  readingNotesCreated: number;
  favoritesAdded: number;
  errorLogsCreated: number;
};

/** Optional deep-link identifiers per source (e.g. blog slugs, note dates). */
export type ActivityLinks = {
  blogs?: string[];
  notes?: string[];
  readingNotes?: string[];
  favorites?: string[];
  errorLogs?: string[];
};

export type AggregatedDay = {
  date: string;
  total: number;
  sources: ActivitySources;
  label: string;
  links?: ActivityLinks;
};

export const EMPTY_SOURCES: ActivitySources = {
  githubCommits: 0,
  blogsPublished: 0,
  notesCreated: 0,
  readingNotesCreated: 0,
  favoritesAdded: 0,
  errorLogsCreated: 0,
};
