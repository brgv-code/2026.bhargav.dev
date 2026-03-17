import type { MetadataRoute } from "next";
import { fetchBlogListPosts } from "@/lib/data/cms";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchBlogListPosts(1000);

  const staticRoutes = ["/", "/about", "/writing", "/projects", "/experience"].map(
    (route) => ({
      url: absoluteUrl(route),
      lastModified: new Date(),
    }),
  );

  const postRoutes = posts.map((post) => ({
    url: absoluteUrl(`/writing/${post.slug}`),
    lastModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
  }));

  return [...staticRoutes, ...postRoutes];
}
