import { fetchBlogListPosts } from "@/lib/data/cms";
import { absoluteUrl, siteName } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toRfc822(dateValue?: string | null): string {
  if (!dateValue) return new Date().toUTCString();
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return new Date().toUTCString();
  return date.toUTCString();
}

export async function GET() {
  const posts = await fetchBlogListPosts(200);
  const siteLink = absoluteUrl("/writing");
  const latestDate =
    posts[0]?.updatedAt ?? posts[0]?.publishedAt ?? posts[0]?.createdAt;

  const items = posts
    .filter((post) => post.slug && post.title)
    .map((post) => {
      const link = absoluteUrl(`/writing/${post.slug}`);
      const title = escapeXml(post.title);
      const description = escapeXml(post.description ?? "");
      const pubDate = toRfc822(
        post.publishedAt ?? post.updatedAt ?? post.createdAt,
      );

      return [
        "<item>",
        `<title>${title}</title>`,
        `<link>${link}</link>`,
        `<guid>${link}</guid>`,
        description ? `<description>${description}</description>` : "",
        `<pubDate>${pubDate}</pubDate>`,
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    `<title>${escapeXml(siteName)} Writing</title>`,
    `<link>${siteLink}</link>`,
    "<description>All published writing and essays.</description>",
    "<language>en</language>",
    `<lastBuildDate>${toRfc822(latestDate)}</lastBuildDate>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
