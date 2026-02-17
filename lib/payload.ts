type PayloadListResult<T> = {
  docs: T[];
};

// In dev, fallback to local CMS so the frontend works when both apps run (portfolio :3000, cms :3001).
const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : undefined);

function logCmsWarning(message: string, detail?: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[Payload CMS]", message, detail ?? "");
  }
}

export async function fetchProfile() {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; profile will be fallback.");
    return null;
  }

  try {
    const res = await fetch(`${cmsUrl}/api/globals/profile`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      logCmsWarning(`Profile fetch failed: ${res.status} ${res.statusText}`, await res.text().catch(() => ""));
      return null;
    }
    return res.json();
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
};

export async function fetchLatestPosts(limit = 3): Promise<PayloadPostSummary[]> {
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

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      logCmsWarning(`Posts fetch failed: ${res.status} ${res.statusText}`, await res.text().catch(() => ""));
      return [];
    }
    const data = (await res.json()) as PayloadListResult<PayloadPostSummary>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Posts fetch error (is the CMS running?)", e);
    return [];
  }
}

/** Block from Payload blocks field; shape varies by block type. */
export type PayloadContentBlock = {
  blockType: string;
  id?: string;
  [key: string]: unknown;
};

export type PayloadPost = PayloadPostSummary & {
  content?: PayloadContentBlock[];
};

/** Fetches a single published post by slug. Returns null if not found. */
export async function fetchPostBySlug(slug: string): Promise<PayloadPost | null> {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; cannot fetch post.");
    return null;
  }

  try {
    const url = new URL(`${cmsUrl}/api/posts`);
    url.searchParams.set("where[slug][equals]", slug);
    url.searchParams.set("where[status][equals]", "published");
    url.searchParams.set("limit", "1");
    url.searchParams.set("depth", "1");

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PayloadListResult<PayloadPost>;
    const post = data.docs?.[0] ?? null;
    return post;
  } catch (e) {
    logCmsWarning("Post fetch error (is the CMS running?)", e);
    return null;
  }
}

export type PayloadWorkExperience = {
  id: string;
  company: string;
  role: string;
  date_range?: string;
  bullets?: {
    id: string;
    label: string;
    href?: string;
  }[];
};

export async function fetchWorkExperience(): Promise<PayloadWorkExperience[]> {
  if (!cmsUrl) {
    logCmsWarning("PAYLOAD_PUBLIC_SERVER_URL not set; work experience will be empty.");
    return [];
  }

  try {
    const url = new URL(`${cmsUrl}/api/work-experience`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("depth", "0");

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      logCmsWarning(`Work experience fetch failed: ${res.status} ${res.statusText}`, await res.text().catch(() => ""));
      return [];
    }
    const data = (await res.json()) as PayloadListResult<PayloadWorkExperience>;
    return data.docs ?? [];
  } catch (e) {
    logCmsWarning("Work experience fetch error (is the CMS running?)", e);
    return [];
  }
}

