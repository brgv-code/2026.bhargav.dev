import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fetchProjectsFromPayload } from "@/lib/data/cms";
import { renderMarkdown } from "@/lib/markdown";
import { BackButton } from "@/components/shared/back-button";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects and case notes.",
};

export const dynamic = "force-static";

function formatStatus(status?: string | null) {
  if (!status) return null;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function ProjectsPage() {
  const projects = await fetchProjectsFromPayload();

  if (!projects || projects.length === 0) return null;

  const entries = await Promise.all(
    projects.map(async (project) => {
      let detail: ReactNode = null;

      if (project.markdownInput) {
        detail = await renderMarkdown(project.markdownInput);
      } else if (project.contentHtml) {
        detail = (
          <div
            className="flex flex-col gap-4 text-base text-secondary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: project.contentHtml }}
          />
        );
      }

      return { project, detail };
    }),
  );

  return (
    <section className="pb-24">
      <div className="mx-auto w-full max-w-xl">
        <div className="grid grid-cols-3 items-center pt-24 mb-10">
          <span />
          <h2 className="text-xs uppercase tracking-[0.35em] text-muted text-center">
            Projects
          </h2>
          <div className="justify-self-end">
            <BackButton className="text-base font-medium text-muted hover:text-primary transition-colors" />
          </div>
        </div>
        <div className="flex flex-col gap-12">
          {entries.map(({ project, detail }) => {
            const title = project.title ?? project.name;
            const techLabels = Array.isArray(project.tech)
              ? project.tech
                  .map((entry) => entry?.label)
                  .filter((label): label is string => Boolean(label))
              : [];
            const statusLabel = formatStatus(project.status ?? null);
            const metaParts = [
              project.year ?? "",
              statusLabel ?? "",
            ].filter(Boolean);

            return (
              <article key={project.id} className="flex flex-col gap-3">
                <a
                  className="text-base font-semibold text-primary"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {title}
                </a>
                {metaParts.length ? (
                  <p className="text-sm text-muted">{metaParts.join(" / ")}</p>
                ) : null}
                <p className="text-base text-secondary">{project.description}</p>
                {detail ? <div className="flex flex-col gap-4">{detail}</div> : null}
                {techLabels.length ? (
                  <p className="text-sm text-muted">
                    Tech: {techLabels.join(", ")}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-4 text-base text-primary">
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit
                    </a>
                  ) : null}
                  {project.github ? (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
