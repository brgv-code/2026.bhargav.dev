import type { MetadataRoute } from "next";
import {
  fetchBlogListPosts,
  fetchProfile,
  fetchProjectsFromPayload,
  fetchWorkExperience,
} from "@/lib/data/cms";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

function maxDate(
  entries: Array<{ updatedAt?: string | null; createdAt?: string | null }>,
): Date {
  const timestamps = entries
    .map((entry) => entry.updatedAt ?? entry.createdAt)
    .map((value) => (value ? new Date(value).getTime() : 0))
    .filter((value) => value > 0);
  if (!timestamps.length) return new Date();
  return new Date(Math.max(...timestamps));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, profile, projects, work] = await Promise.all([
    fetchBlogListPosts(1000),
    fetchProfile(),
    fetchProjectsFromPayload(),
    fetchWorkExperience(),
  ]);

  const aboutLastModified = profile?.updatedAt ?? profile?.createdAt ?? new Date();
  const projectsLastModified = maxDate(projects);
  const experienceLastModified = maxDate(work);

  const staticRoutes = ["/", "/about", "/writing", "/projects", "/experience"].map(
    (route) => {
      if (route === "/about") {
        return { url: absoluteUrl(route), lastModified: aboutLastModified };
      }
      if (route === "/projects") {
        return { url: absoluteUrl(route), lastModified: projectsLastModified };
      }
      if (route === "/experience") {
        return { url: absoluteUrl(route), lastModified: experienceLastModified };
      }
      return { url: absoluteUrl(route), lastModified: new Date() };
    },
  );

  const postRoutes = posts.map((post) => ({
    url: absoluteUrl(`/writing/${post.slug}`),
    lastModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
  }));

  return [...staticRoutes, ...postRoutes];
}
