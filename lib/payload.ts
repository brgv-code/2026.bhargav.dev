type PayloadListResult<T> = {
  docs: T[];
};

const cmsUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL;

if (!cmsUrl) {
  // In dev you can set PAYLOAD_PUBLIC_SERVER_URL to point to the Payload app.
  // We deliberately don't throw here to avoid breaking the whole site.
}

export async function fetchProfile() {
  if (!cmsUrl) return null;

  const res = await fetch(`${cmsUrl}/api/globals/profile`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  return res.json();
}

export type PayloadPostSummary = {
  id: string;
  title: string;
  slug: string;
  publishedAt?: string;
};

export async function fetchLatestPosts(limit = 3): Promise<PayloadPostSummary[]> {
  if (!cmsUrl) return [];

  const url = new URL(`${cmsUrl}/api/posts`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("sort", "-publishedAt");
  url.searchParams.set("where[status][equals]", "published");

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as PayloadListResult<PayloadPostSummary>;
  return data.docs;
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
  if (!cmsUrl) return [];

  const url = new URL(`${cmsUrl}/api/work-experience`);
  url.searchParams.set("limit", "100");

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as PayloadListResult<PayloadWorkExperience>;
  return data.docs;
}

