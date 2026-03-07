import { getPayload } from "payload";
import config from "../payload.config";

type SeedProject = {
  name: string;
  title?: string;
  description: string;
  url: string;
  status?: "active" | "wip" | "archived";
  year?: string;
  tech?: string[];
  github?: string;
};

const SEED_PROJECTS: SeedProject[] = [
  {
    name: "Portfolio 2026",
    description: "This website :)",
    url: "#",
    status: "wip",
    year: "2024",
    tech: ["Next.js", "Payload", "React"],
    github: "https://github.com/brgv-code/2026.bhargav.dev",
  },
  {
    name: "Onyx",
    description: "Photo sharing platform",
    url: "https://onyxgallery.me",
    status: "wip",
    year: "2024",
    tech: ["Next.js", "Payload", "React"],
  },
  {
    name: "sutramd",
    description: "Next-gen markdown editor with live preview.",
    url: "https://bhargav.dev/projects/sutramd",
    status: "wip",
    year: "2024",
    tech: ["TypeScript", "ProseMirror"],
    github: "https://github.com/brgv-code/sutramd",
  },
  {
    name: "react-progress-bar",
    description: "Accessible React progress component with customizable styling.",
    url: "https://loader.bhargav.dev/",
    status: "active",
    year: "2023",
    tech: ["React", "CSS"],
    github: "https://github.com/brgv-code/react-progress-bar",
  },
];

function normalizeTech(values?: string[]): { label: string }[] | undefined {
  if (!values || values.length === 0) return undefined;

  const labels = values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (labels.length === 0) return undefined;

  return labels.map((label) => ({ label }));
}

async function run(): Promise<void> {
  const payload = await getPayload({ config });
  const dryRun = process.argv.includes("--dry-run");

  console.log(
    dryRun
      ? "Seeding projects in dry-run mode (no writes)."
      : "Seeding projects into Payload...",
  );

  let created = 0;
  let updated = 0;

  for (const seed of SEED_PROJECTS) {
    let query;
    try {
      query = await payload.find({
        collection: "projects",
        limit: 1,
        depth: 0,
        where: {
          or: [
            { name: { equals: seed.name } },
            { url: { equals: seed.url } },
          ],
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      if (/no such table|relation .* does not exist|projects/i.test(message)) {
        throw new Error(
          "Projects table is missing. Run CMS migrations first: `pnpm --filter @repo/cms run migrate`.",
        );
      }
      throw error;
    }

    const data = {
      name: seed.name,
      title: seed.title,
      description: seed.description,
      url: seed.url,
      status: seed.status ?? "wip",
      year: seed.year,
      tech: normalizeTech(seed.tech),
      github: seed.github,
    };

    if (query.docs.length === 0) {
      if (!dryRun) {
        await payload.create({
          collection: "projects",
          data,
        });
      }
      created += 1;
      console.log(`[projects] created: ${seed.name}`);
      continue;
    }

    if (!dryRun) {
      await payload.update({
        collection: "projects",
        id: query.docs[0]!.id,
        data,
      });
    }
    updated += 1;
    console.log(`[projects] updated: ${seed.name}`);
  }

  console.log(
    `[projects] done. created=${created}, updated=${updated}, total=${SEED_PROJECTS.length}`,
  );
  await payload.destroy();
}

try {
  await run();
} catch (error) {
  console.error("[seed-projects] failed", error);
  process.exit(1);
}
