export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteName = "Bhargav";

export const defaultTitle = "Bhargav | Developer Portfolio";

export const defaultDescription =
  "Product focused developer turning coffee into code with Sutra and bringing ideas to life.";

export function absoluteUrl(path = "/"): string {
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return path.startsWith("http") ? path : `http://localhost:3000${path}`;
  }
}

export function buildSameAs(links: Array<string | null | undefined>): string[] {
  return links.filter((link): link is string => Boolean(link));
}
