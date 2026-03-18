import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { formatActivityDate } from "@/lib/format";

type PayloadListResult<T> = {
  docs: T[];
};

const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : undefined);

const TAGS = {
  posts: "posts",
  projects: "projects",
  experience: "experience",
  profile: "profile",
  favorites: "favorites",
  reading: "reading",
  streaks: "streaks",
  notebooks: "notebooks",
} as const;

type PayloadFetchOptions = {
  tags?: string[];
  revalidate?: number;
};

function payloadFetchOptions(options: PayloadFetchOptions = {}) {
  const { tags, revalidate } = options;
  return {
    cache: "force-cache" as const,
    next: {
      tags,
      revalidate,
    },
  };
}

function logCmsWarning(message: string, detail?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[Payload CMS]", message, detail ?? "");
  }
}

export type PayloadProfile = {
  name: string;
  tagline?: string | null;
  bio?: string | null;
  available_for_work?: boolean | null;
  github?: string | null;
  x?: string | null;
  linkedin?: string | null;
  email?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export async function fetchProfile(): Promise<PayloadProfile | null> {
  if (!cmsUrl) {
    logCmsWarning(
      "PAYLOAD_PUBLIC_SERVER_URL not set; profile will be fallback.",
    );
    return null;
  }

  try {
    const res = await fetch(
      `${cmsUrl}/api/globals/profile`,
      payloadFetchOptions({ tags: [TAGS.profile], revalidate: 60 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Profile fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return null;
    }
    return (await res.json()) as PayloadProfile;
  } catch (e) {
    logCmsWarning("Profile fetch error (is the CMS running?)", e);
    return null;
  }
}

export type PayloadPostSummary = {
  id: string;
  title: string;
  slug: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PayloadMedia = {
  id?: number;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
};

/** Resolves a raw media URL by prepending the CMS base URL when needed. */
export function resolveMediaSrc(url: string): string {
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "";
  return url.startsWith("http") || !baseUrl ? url : `${baseUrl}${url}`;
}

/** Resolves a PayloadMedia object's URL, returning null if no valid media. */
export function resolveMediaUrl(
  media: PayloadMedia | number | null | undefined,
): PayloadMedia | null {
  if (!media || typeof media !== "object" || !media.url) return null;
  return { ...media, url: resolveMediaSrc(media.url) };
}

export type PayloadTag = {
  id: number;
  name: string;
  slug: string;
};

export function tagNames(tags: PayloadTag[] | null | undefined): string[] {
  if (!tags?.length) return [];
  return tags
    .map((t) =>
      typeof t === "object" && t != null && "name" in t ? t.name : null,
    )
    .filter((n): n is string => typeof n === "string");
}

export async function fetchLatestPosts(
  limit = 3,
): Promise<PayloadPostSummary[]> {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; posts will be empty.");
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/posts`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("sort", "-publishedAt");
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("depth", "0");
    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.posts], revalidate: 60 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Posts fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return [];
    }
    const data = (await res.json()) as PayloadListResult<PayloadPostSummary>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Posts fetch error (is the CMS running?)", e);
    return [];
  }
}

export type PayloadPostListItem = PayloadPostSummary & {
  description?: string | null;
  readingTime?: number | null;
  tags?: PayloadTag[] | null;
};

export async function fetchBlogListPosts(
  limit = 50,
): Promise<PayloadPostListItem[]> {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; blog list will be empty.");
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/posts`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("sort", "-publishedAt");
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("depth", "1");
    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.posts], revalidate: 60 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Blog list fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return [];
    }
    const data = (await res.json()) as PayloadListResult<PayloadPostListItem>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Blog list fetch error (is the CMS running?)", e);
    return [];
  }
}

export type PayloadTocItem = {
  id: string;
  text: string;
  level: number;
};

export type PayloadPost = PayloadPostSummary & {
  description?: string | null;
  content?: SerializedEditorState | null;
  markdownInput?: string | null;
  contentHtml?: string | null;
  coverImage?: PayloadMedia | number | null;
  readingTime?: number | null;
  wordCount?: number | null;
  tags?: PayloadTag[] | null;
  tocItems?: PayloadTocItem[] | null;
};

export async function fetchPostBySlug(
  slug: string,
): Promise<PayloadPost | null> {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; cannot fetch post.");
    return null;
  }

  try {
    const url = new URL(`${cmsUrl}/api/posts`);
    url.searchParams.set("where[slug][equals]", slug);
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("limit", "1");
    url.searchParams.set("depth", "2");

    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.posts], revalidate: 60 }),
    );
    if (!res.ok) return null;
    const data = (await res.json()) as PayloadListResult<PayloadPost>;
    const post = data.docs?.[0] ?? null;
    return post;
  } catch (e) {
    logCmsWarning("Post fetch error (is the CMS running?)", e);
    return null;
  }
}

export async function fetchPostSlugs(): Promise<string[]> {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; post slugs empty.");
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/posts`);
    url.searchParams.set("limit", "500");
    url.searchParams.set("sort", "-publishedAt");
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("depth", "0");
    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.posts], revalidate: 60 }),
    );
    if (!res.ok) return [];
    const data = (await res.json()) as PayloadListResult<PayloadPostSummary>;
    return (data.docs ?? []).map((doc) => doc.slug).filter(Boolean);
  } catch (e) {
    logCmsWarning("Post slugs fetch error (is the CMS running?)", e);
    return [];
  }
}

export async function fetchRelatedPosts(
  excludeSlug: string,
  limit = 4
): Promise<PayloadPostSummary[]> {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; related posts will be empty.");
    return [];
  }
  try {
    const url = new URL(`${cmsUrl}/api/posts`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("sort", "-publishedAt");
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("where[slug][not_equals]", excludeSlug);
    url.searchParams.set("depth", "0");
    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.posts], revalidate: 60 }),
    );
    if (!res.ok) return [];
    const data = (await res.json()) as PayloadListResult<PayloadPostSummary>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Related posts fetch error", e);
    return [];
  }
}

export type PayloadWorkExperience = {
  id: string;
  company: string;
  role: string;
  date_range?: string;
  logo?: PayloadMedia | number | null;
  tech_stack?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;

  markdownInput?: string | null;

  contentHtml?: string | null;
  bullets?: {
    id: string;
    label: string;
    href?: string;
  }[];
};

export async function fetchWorkExperience(): Promise<PayloadWorkExperience[]> {
  if (!cmsUrl) {
    logCmsWarning(
      "PAYLOAD_PUBLIC_SERVER_URL not set; work experience will be empty.",
    );
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/work-experience`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("depth", "1");

    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.experience], revalidate: 300 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Work experience fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return [];
    }
    const data = (await res.json()) as PayloadListResult<PayloadWorkExperience>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Work experience fetch error (is the CMS running?)", e);
    return [];
  }
}

export type PayloadProject = {
  id: number;
  name: string;
  title?: string | null;
  description: string;
  url: string;
  status?: "active" | "wip" | "archived" | null;
  year?: string | null;
  markdownInput?: string | null;
  contentHtml?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  applicationCategory?: string | null;
  operatingSystem?: string | string[] | null;
  offers?: {
    price?: string | null;
    priceCurrency?: string | null;
    availability?: string | null;
    url?: string | null;
  } | null;
  tech?:
    | {
        id?: string;
        label: string;
      }[]
    | null;
  github?: string | null;
};

export async function fetchProjectsFromPayload(): Promise<PayloadProject[]> {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; projects will be empty.");
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/projects`);
    url.searchParams.set("limit", "200");
    url.searchParams.set("sort", "-updatedAt");
    url.searchParams.set("depth", "0");

    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.projects], revalidate: 300 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Projects fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return [];
    }
    const data = (await res.json()) as PayloadListResult<PayloadProject>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Projects fetch error (is the CMS running?)", e);
    return [];
  }
}

export type PayloadFavorite = {
  id: number;
  type?: "article" | "video" | "podcast" | "book" | "tool" | null;
  title: string;
  url?: string | null;
  thumbnailUrl?: string | null;
  source?: string | null;
  thoughts?: string | null;
  dateAdded?: string | null;
  updatedAt: string;
  createdAt: string;
};

export async function fetchFavoritesFromPayload(): Promise<PayloadFavorite[]> {
  if (!cmsUrl) {
    logCmsWarning(
      "PAYLOAD_PUBLIC_SERVER_URL not set; Payload favorites will be empty.",
    );
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/favorites`);
    url.searchParams.set("limit", "500");
    url.searchParams.set("sort", "-createdAt");
    url.searchParams.set("depth", "0");

    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.favorites], revalidate: 60 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Favorites fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return [];
    }
    const data = (await res.json()) as PayloadListResult<PayloadFavorite>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Favorites fetch error (is the CMS running?)", e);
    return [];
  }
}

// ─── Reading tracker (books + notes) ─────────────────────────────────────────

export type PayloadBookStatus = "reading" | "completed" | "paused" | "wishlist";

export type PayloadBook = {
  id: number;
  title: string;
  author?: string | null;
  totalPages?: number | null;
  currentPage?: number | null;
  status?: PayloadBookStatus | null;
  summary?: string | null;
  updatedAt?: string;
  createdAt?: string;
};

export type PayloadReadingNote = {
  id: number;
  book: number | PayloadBook;
  date: string;
  pageStart: number;
  pageEnd: number;
  pagesRead?: number | null;
  thoughts?: string | null;
  updatedAt?: string;
  createdAt?: string;
};

export async function fetchCurrentBookFromPayload(): Promise<PayloadBook | null> {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; current book will be empty.");
    return null;
  }

  try {
    const url = new URL(`${cmsUrl}/api/books`);
    url.searchParams.set("limit", "1");
    url.searchParams.set("sort", "-updatedAt");
    url.searchParams.set("where[status][equals]", "reading");
    url.searchParams.set("depth", "0");

    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.reading], revalidate: 30 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Current book fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return null;
    }
    const data = (await res.json()) as PayloadListResult<PayloadBook>;
    return data.docs?.[0] ?? null;
  } catch (e) {
    logCmsWarning("Current book fetch error (is the CMS running?)", e);
    return null;
  }
}

export async function fetchReadingNotesFromPayload(
  bookId: number,
): Promise<PayloadReadingNote[]> {
  if (!cmsUrl) {
    logCmsWarning(
      "PAYLOAD_PUBLIC_SERVER_URL not set; reading notes will be empty.",
    );
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/reading-notes`);
    url.searchParams.set("limit", "365");
    url.searchParams.set("sort", "-date");
    url.searchParams.set("depth", "0");
    url.searchParams.set("where[book][equals]", String(bookId));

    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.reading], revalidate: 15 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Reading notes fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return [];
    }

    const data = (await res.json()) as PayloadListResult<PayloadReadingNote>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Reading notes fetch error (is the CMS running?)", e);
    return [];
  }
}

export type PayloadHabitCompletion = {
  id: number;
  habitKey: "reading" | "workout" | "steps" | "eating" | "sleep" | "coding" | "editing";
  date: string;
  completed?: boolean | null;
  value?: number | null;
  notes?: string | null;
  readingNote?: number | PayloadReadingNote | null;
  updatedAt?: string;
  createdAt?: string;
};

export async function fetchHabitCompletionsFromPayload(
  limit = 1000,
): Promise<PayloadHabitCompletion[]> {
  if (!cmsUrl) {
    logCmsWarning(
      "PAYLOAD_PUBLIC_SERVER_URL not set; habit completions will be empty.",
    );
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/habit-completions`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("sort", "-date");
    url.searchParams.set("depth", "0");

    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.streaks], revalidate: 15 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Habit completions fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return [];
    }

    const data = (await res.json()) as PayloadListResult<PayloadHabitCompletion>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Habit completions fetch error (is the CMS running?)", e);
    return [];
  }
}

/** Per-day contribution counts for tooltip. */
export type PayloadActivitySources = {
  githubCommits: number;
  blogsPublished: number;
  notesCreated: number;
  readingNotesCreated: number;
  favoritesAdded: number;
  errorLogsCreated: number;
};

/** Activity log day for the streak grid (date, intensity 0–1, summary, optional sources). */
export type PayloadActivityDay = {
  date: string;
  intensity: number;
  summary: string;
  sources?: PayloadActivitySources;
};

export type PayloadStreak = {
  id: string;
  label: string;
  date: string;
  completed?: boolean;
};

export async function fetchActivityFromPayload(): Promise<PayloadActivityDay[]> {
  if (!cmsUrl) {
    logCmsWarning(
      "PAYLOAD_PUBLIC_SERVER_URL not set; activity log will use fallback.",
    );
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/streaks`);
    url.searchParams.set("limit", "50");
    url.searchParams.set("sort", "-date");
    url.searchParams.set("depth", "0");

    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.streaks], revalidate: 60 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Streaks fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return [];
    }
    const data = (await res.json()) as PayloadListResult<PayloadStreak>;
    const docs = data.docs ?? [];

    return docs.slice(0, 14).map((s) => ({
      date: formatActivityDate(s.date),
      intensity: s.completed ? 0.85 : 0.35,
      summary: s.label || "Activity",
    }));
  } catch (e) {
    logCmsWarning("Activity/streaks fetch error (is the CMS running?)", e);
    return [];
  }
}


// ─── Notebooks (daily notes) ─────────────────────────────────────────────────

export type PayloadNotebookBlock = {
  id?: string;
  blockId: string;
  type: "thought" | "code" | "link" | "learning" | "quote";
  content: string;
  lang?: string | null;
  meta?: string | null;
  tags?: string[] | null;
};

export type PayloadNotebook = {
  id: number | string;
  date: string;
  visibility: "public" | "private";
  pinned?: boolean;
  blocks?: PayloadNotebookBlock[] | null;
  updatedAt?: string;
  createdAt?: string;
};

export async function fetchNotebooks(): Promise<PayloadNotebook[]> {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; notebooks will be empty.");
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/notebooks`);
    url.searchParams.set("limit", "500");
    url.searchParams.set("sort", "-date");
    url.searchParams.set("depth", "1");

    const res = await fetch(
      url.toString(),
      payloadFetchOptions({ tags: [TAGS.notebooks], revalidate: 30 }),
    );
    if (!res.ok) {
      logCmsWarning(
        `Notebooks fetch failed: ${res.status} ${res.statusText}`,
        await res.text().catch(() => ""),
      );
      return [];
    }
    const data = (await res.json()) as PayloadListResult<PayloadNotebook>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Notebooks fetch error (is the CMS running?)", e);
    return [];
  }
}
