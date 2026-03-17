import {
  fetchBlogListPosts,
  fetchProfile,
  fetchProjectsFromPayload,
  fetchWorkExperience,
} from "@/lib/data/cms";
import { absoluteUrl, defaultDescription, siteName } from "@/lib/seo";
import { tagNames } from "@/lib/data/cms";

export const dynamic = "force-static";
export const revalidate = 3600;

function formatDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function toTimestamp(value?: string | null): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getTime();
}

const researchKeywords = {
  roles: [
    "Software Engineer",
    "Software Developer",
    "Full Stack Developer",
    "Front-End Engineer",
    "Application Developer",
    "Application Integration Engineer",
    "Software Architect",
    "DevOps Engineer",
    "Systems Engineer",
    "Ai Engineer",
  ],
  coreWork: [
    "requirements analysis",
    "software design",
    "system integration",
    "software testing",
    "performance optimization",
    "maintenance and upgrades",
    "technical documentation",
  ],
  qualities: [
    "analytical skills",
    "communication skills",
    "creativity",
    "detail oriented",
    "interpersonal skills",
    "problem-solving",
  ],
  languagesAndWeb: [
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "SQL",
    "Python",
    "Java",
    "Node.js",
    "React",
    "Next.js",
    "Angular",
    "Vue.js",
  ],
  cloudAndTools: [
    "AWS",
    "Azure",
    "Docker",
    "Kubernetes",
    "Git",
    "GitHub",
    "Jira",
    "GitLab",
    "PostgreSQL",
    "MySQL",
    "NoSQL",
  ],
  aiTools: ["ChatGPT", "GitHub Copilot", "Google Gemini", "Claude"],
};

export async function GET() {
  const [profile, posts, projects, work] = await Promise.all([
    fetchProfile(),
    fetchBlogListPosts(20),
    fetchProjectsFromPayload(),
    fetchWorkExperience(),
  ]);

  const tagline = profile?.tagline ?? defaultDescription;
  const name = profile?.name ?? siteName;
  const postTopics = Array.from(
    new Set(posts.flatMap((post) => tagNames(post.tags)).filter(Boolean))
  );
  const projectTech = Array.from(
    new Set(
      projects
        .flatMap((project) =>
          project.tech?.map((entry) => entry?.label?.trim()).filter(Boolean)
        )
        .filter(Boolean)
    )
  );
  const updatedCandidates = [
    profile?.updatedAt,
    ...posts.map(
      (post) => post.updatedAt ?? post.publishedAt ?? post.createdAt
    ),
  ]
    .map((value) => toTimestamp(value))
    .filter((value): value is number => typeof value === "number");
  const lastUpdated =
    updatedCandidates.length > 0
      ? new Date(Math.max(...updatedCandidates)).toISOString().slice(0, 10)
      : null;

  const lines: string[] = [];
  lines.push(`# ${name} — Developer Portfolio`);
  lines.push(`URL: ${absoluteUrl("/")}`);
  lines.push(`Summary: ${tagline}`);
  if (profile?.available_for_work != null) {
    lines.push(
      `Availability: ${profile.available_for_work ? "Open to work" : "Unavailable"}`
    );
  }
  if (postTopics.length) {
    lines.push(`Topics: ${postTopics.join(", ")}`);
  }
  if (projectTech.length) {
    lines.push(`Project tech: ${projectTech.join(", ")}`);
  }
  if (lastUpdated) {
    lines.push(`Last updated: ${lastUpdated}`);
  }
  lines.push("");
  lines.push("## Research-backed keywords");
  lines.push(`Roles: ${researchKeywords.roles.join(", ")}`);
  lines.push(`Core work: ${researchKeywords.coreWork.join(", ")}`);
  lines.push(`Qualities: ${researchKeywords.qualities.join(", ")}`);
  lines.push(`Languages & web: ${researchKeywords.languagesAndWeb.join(", ")}`);
  lines.push(`Cloud & tools: ${researchKeywords.cloudAndTools.join(", ")}`);
  lines.push(`AI tools: ${researchKeywords.aiTools.join(", ")}`);
  lines.push("");
  lines.push("## Pages");
  lines.push(`- About: ${absoluteUrl("/about")}`);
  lines.push(`- Writing: ${absoluteUrl("/writing")}`);
  lines.push(`- Projects: ${absoluteUrl("/projects")}`);
  lines.push(`- Experience: ${absoluteUrl("/experience")}`);
  lines.push("");
  lines.push("## Writing");
  if (posts.length) {
    posts.forEach((post) => {
      const date =
        formatDate(post.publishedAt) ??
        formatDate(post.updatedAt) ??
        formatDate(post.createdAt) ??
        "";
      const suffix = date ? ` (${date})` : "";
      lines.push(
        `- ${post.title}${suffix}: ${absoluteUrl(`/writing/${post.slug}`)}`
      );
    });
  } else {
    lines.push("- None published yet.");
  }
  lines.push("");
  lines.push("## Projects");
  if (projects.length) {
    projects.slice(0, 20).forEach((project) => {
      const title = project.title ?? project.name;
      const url = project.url || absoluteUrl("/projects");
      const description = project.description?.trim();
      lines.push(
        description
          ? `- ${title}: ${url} — ${description}`
          : `- ${title}: ${url}`
      );
    });
  } else {
    lines.push("- None listed yet.");
  }
  lines.push("");
  lines.push("## Experience");
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
  lines.push("## Contact");
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
