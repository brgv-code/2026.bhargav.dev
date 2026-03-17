import {
  fetchBlogListPosts,
  fetchProfile,
  fetchProjectsFromPayload,
  fetchWorkExperience,
} from "@/lib/data/cms";
import { absoluteUrl, defaultDescription, siteName } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600;

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const [profile, posts, projects, work] = await Promise.all([
    fetchProfile(),
    fetchBlogListPosts(20),
    fetchProjectsFromPayload(),
    fetchWorkExperience(),
  ]);

  const tagline = profile?.tagline ?? defaultDescription;
  const name = profile?.name ?? siteName;

  const lines: string[] = [];
  lines.push(`# ${name} — Developer Portfolio`);
  lines.push(`URL: ${absoluteUrl("/")}`);
  lines.push(`Description: ${tagline}`);
  lines.push("");
  lines.push("Pages:");
  lines.push(`- About: ${absoluteUrl("/about")}`);
  lines.push(`- Writing: ${absoluteUrl("/writing")}`);
  lines.push(`- Projects: ${absoluteUrl("/projects")}`);
  lines.push(`- Experience: ${absoluteUrl("/experience")}`);
  lines.push("");
  lines.push("Writing:");
  if (posts.length) {
    posts.forEach((post) => {
      const date =
        formatDate(post.publishedAt) ??
        formatDate(post.updatedAt) ??
        formatDate(post.createdAt) ??
        "";
      const suffix = date ? ` (${date})` : "";
      lines.push(
        `- ${post.title}${suffix}: ${absoluteUrl(`/writing/${post.slug}`)}`,
      );
    });
  } else {
    lines.push("- None published yet.");
  }
  lines.push("");
  lines.push("Projects:");
  if (projects.length) {
    projects.slice(0, 20).forEach((project) => {
      const title = project.title ?? project.name;
      const url = project.url || absoluteUrl("/projects");
      const description = project.description?.trim();
      lines.push(
        description
          ? `- ${title}: ${url} — ${description}`
          : `- ${title}: ${url}`,
      );
    });
  } else {
    lines.push("- None listed yet.");
  }
  lines.push("");
  lines.push("Experience:");
  if (work.length) {
    work.slice(0, 20).forEach((item) => {
      const role = item.role ?? "Role";
      const company = item.company ?? "Company";
      const range = item.date_range ? ` (${item.date_range})` : "";
      lines.push(`- ${role} @ ${company}${range}`);
    });
  } else {
    lines.push("- None listed yet.");
  }
  lines.push("");
  lines.push("Contact:");
  if (profile?.email) lines.push(`- Email: ${profile.email}`);
  if (profile?.github) lines.push(`- GitHub: ${profile.github}`);
  if (profile?.linkedin) lines.push(`- LinkedIn: ${profile.linkedin}`);
  if (profile?.x) lines.push(`- X: ${profile.x}`);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
