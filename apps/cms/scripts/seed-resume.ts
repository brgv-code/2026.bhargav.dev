import { getPayload } from "payload";
import type { CollectionSlug } from "payload";
import config from "../payload.config";

const dryRun = process.argv.includes("--dry-run");

// ── helpers ────────────────────────────────────────────────────────────────────

function normalizeTech(values: string[]): { label: string }[] {
  return values.map((v) => ({ label: v.trim() })).filter((v) => v.label);
}

async function upsertByField<T extends Record<string, unknown>>(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollectionSlug,
  matchField: string,
  matchValue: string,
  data: T,
): Promise<void> {
  const existing = await payload.find({
    collection,
    limit: 1,
    depth: 0,
    where: { [matchField]: { equals: matchValue } },
  });

  if (existing.docs.length === 0) {
    if (!dryRun) await payload.create({ collection, data });
    console.log(`[${collection}] created: ${matchValue}`);
  } else {
    if (!dryRun) await payload.update({ collection, id: existing.docs[0]!.id as string | number, data });
    console.log(`[${collection}] updated: ${matchValue}`);
  }
}

// ── data ────────────────────────────────────────────────────────────────────────

const WORK_EXPERIENCE = [
  {
    company: "acemate.ai",
    role: "Full-Stack Developer",
    date_range: "2025–present",
    location: "Berlin",
    summary: "Early-stage AI startup helping students prepare for exams.",
    tech: normalizeTech(["Next.js", "TypeScript", "n8n", "Tailwind"]),
    order: 1,
    markdownInput: `Shipped product features and AI integrations across the Next.js application.

- Integrated Featurebase to centralize user feedback; built n8n automations connecting product events to Slack.
- Authored the marketing blog and resolved Google Search Console indexing issues.`,
  },
  {
    company: "Foundamental VC",
    role: "App Developer",
    date_range: "2023–2025",
    location: "Berlin",
    summary:
      "Global VC firm investing in construction, manufacturing, and supply chain.",
    tech: normalizeTech([
      "Next.js",
      "TypeScript",
      "Python",
      "OpenAI",
      "Pinecone",
      "Supabase",
      "n8n",
    ]),
    order: 2,
    markdownInput: `Built Loura CRM, a custom Next.js platform that streamlined dealflow and investment workflows.

- Sole developer of a Python startup discovery engine with multi-source pipelines and embedding similarity search.`,
  },
  {
    company: "Fraunhofer IOSB",
    role: "Full-Stack Developer",
    date_range: "2022–2023",
    location: "Karlsruhe",
    summary:
      "Applied research institute, hospital-staff decision-support project.",
    tech: normalizeTech(["Vue.js", "Docker", "NGINX", "TypeScript"]),
    order: 3,
    markdownInput: `Built an interactive web platform visualising real-time hospital sensor data for clinical staff.

- Dockerised Draw.io to SVG conversion pipelines, deployed via NGINX; implemented Vue.js components for non-technical users.`,
  },
  {
    company: "Accenture",
    role: "Software Engineer",
    date_range: "2017–2022",
    location: "Bengaluru, India",
    summary: "Enterprise consulting across Disney and Dell.",
    tech: normalizeTech(["Angular", "TypeScript", "Node.js", "SQL"]),
    order: 4,
    markdownInput: `Shipped onboarding features for Disney's MagicBand+ experience used by millions of park visitors.

- Designed dashboards and monitoring systems for Dell; led Angular 1.x to Angular 11 migration.`,
  },
];

const PROJECTS = [
  {
    name: "OpenAEO",
    title: "OpenAEO",
    description:
      "Open-source MCP server tracking brand visibility in AI search answers (Perplexity, Claude, ChatGPT).",
    url: "https://github.com/brgv-code",
    github: "https://github.com/brgv-code",
    status: "active" as const,
    year: "2025",
    tech: normalizeTech(["TypeScript", "Node.js", "MCP", "Vitest"]),
    markdownInput: `Pure-core architecture with pluggable adapters; exposed as a Claude-compatible MCP tool.

Build documented publicly in a dev log series.`,
  },
  {
    name: "Onyx",
    title: "Onyx",
    description: "Self-hosted photo sharing platform.",
    url: "https://onyxgallery.me",
    status: "active" as const,
    year: "2024",
    tech: normalizeTech(["Next.js", "Payload", "React"]),
    markdownInput: `Built on Payload CMS with a custom gallery UI.

Self-hosted on a VPS with Docker and NGINX.`,
  },
  {
    name: "Lumen",
    title: "Lumen",
    description:
      "Chrome extension overlaying AI definitions, summaries, and bookmarks onto any webpage.",
    url: "#",
    status: "wip" as const,
    year: "2024",
    tech: normalizeTech(["WXT", "TypeScript", "React"]),
    markdownInput: `Built as a browser extension using WXT.

Injects an overlay into any page without affecting the host site's styles.`,
  },
];

const COMMUNITY = [
  {
    name: "Berlin AI Meetup",
    role: "Co-organizer",
    url: "https://luma.com/ct77pyng",
    startDate: "2025",
    endDate: "",
    description:
      "Community for engineers, founders, and operators integrating AI into real products and workflows.",
    order: 1,
  },
];

const RESEARCH = [
  {
    title: "Prospect Certainty Framework",
    subtitle: "Master's Thesis",
    institution: "TU Ilmenau",
    year: "2025",
    description:
      "Framework to detect and mitigate LLM hallucinations using Prospect Theory and logit masking.",
    url: "",
    order: 1,
  },
];

const SKILLS = [
  {
    category: "Frontend",
    items: [
      { name: "Next.js" },
      { name: "React" },
      { name: "TypeScript" },
      { name: "Tailwind CSS" },
    ],
    order: 1,
  },
  {
    category: "Backend & AI",
    items: [
      { name: "Node.js" },
      { name: "Python" },
      { name: "Supabase" },
      { name: "MCP" },
    ],
    order: 2,
  },
  {
    category: "Infra",
    items: [
      { name: "Docker" },
      { name: "Cloudflare" },
      { name: "NGINX" },
      { name: "n8n" },
      { name: "Self-hosted VPS" },
    ],
    order: 3,
  },
];

const EDUCATION = [
  {
    institution: "TU Ilmenau",
    degree: "MSc, Computer and Systems Engineering",
    location: "Germany",
    startYear: "2022",
    endYear: "",
    note: "thesis in progress",
    order: 1,
  },
  {
    institution: "NIE Mysuru",
    degree: "B.E., Electronics and Communication",
    location: "India",
    startYear: "2013",
    endYear: "2017",
    note: "Grade 1.5 (German equivalent — distinction)",
    order: 2,
  },
];

const LANGUAGES = [
  { language: "English", level: "fluent", order: 1 },
  { language: "German", level: "A2", order: 2 },
  { language: "Hindi", level: "native", order: 3 },
  { language: "Kannada", level: "native", order: 4 },
];

// ── run ─────────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  const payload = await getPayload({ config });

  console.log(dryRun ? "Dry run — no writes." : "Seeding CV data...");

  for (const entry of WORK_EXPERIENCE) {
    await upsertByField(payload, "work-experience", "company", entry.company, entry);
  }

  for (const project of PROJECTS) {
    await upsertByField(payload, "projects", "name", project.name, project);
  }

  for (const entry of COMMUNITY) {
    await upsertByField(payload, "community", "name", entry.name, entry);
  }

  for (const entry of RESEARCH) {
    await upsertByField(payload, "research", "title", entry.title, entry);
  }

  for (const entry of SKILLS) {
    await upsertByField(payload, "skills", "category", entry.category, entry);
  }

  for (const entry of EDUCATION) {
    await upsertByField(payload, "education", "degree", entry.degree, entry);
  }

  for (const entry of LANGUAGES) {
    await upsertByField(payload, "languages", "language", entry.language, entry);
  }

  // Update profile global with resume summary
  const RESUME_SUMMARY =
    "Full-stack developer with 7+ years building production TypeScript and Next.js applications across enterprise and early-stage AI startups. Co-organizer of the Berlin AI Meetup.";

  if (!dryRun) {
    const existing = await payload.findGlobal({ slug: "profile", depth: 0 });
    await payload.updateGlobal({
      slug: "profile",
      data: {
        name: existing.name || "Bhargav",
        tagline: existing.tagline ?? undefined,
        bio: existing.bio ?? undefined,
        resume_summary: RESUME_SUMMARY,
        available_for_work: existing.available_for_work ?? true,
        github: existing.github ?? undefined,
        x: existing.x ?? undefined,
        linkedin: existing.linkedin ?? undefined,
        email: existing.email ?? undefined,
      },
    });
    console.log("[profile] resume_summary updated");
  } else {
    console.log("[profile] resume_summary (dry run — skipped)");
  }

  console.log("Done.");
  await payload.destroy();
}

try {
  await run();
} catch (error) {
  console.error("[seed-resume] failed", error);
  process.exit(1);
}
