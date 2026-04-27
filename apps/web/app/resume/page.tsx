import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import {
  fetchWorkExperience,
  fetchProjectsFromPayload,
  fetchProfile,
  fetchEducation,
  fetchResearch,
  fetchCommunity,
  fetchSkills,
  fetchLanguages,
  fetchCvPdf,
} from "@/lib/data/cms";
import { absoluteUrl, siteName } from "@/lib/seo";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { ResumeEntry } from "@/components/resume/resume-entry";

export const metadata: Metadata = {
  title: "Resume",
  description: "Full-stack developer · Berlin · Open to full-time.",
  alternates: { canonical: absoluteUrl("/resume") },
  openGraph: {
    type: "website",
    title: "Resume",
    description: "Full-stack developer · Berlin · Open to full-time.",
    url: absoluteUrl("/resume"),
    siteName,
  },
};

export const dynamic = "force-static";
export const revalidate = 300;

const FALLBACK_SUMMARY =
  "Full-stack developer with 7+ years building production TypeScript and Next.js applications across enterprise and early-stage AI startups. Co-organizer of the Berlin AI Meetup.";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-border px-6 py-3">
      <h2 className="text-2xs font-mono uppercase tracking-widest text-muted">
        {children}
      </h2>
    </div>
  );
}

export default async function ResumePage() {
  const [work, projects, profile, education, research, community, skills, languages, cvPdf] =
    await Promise.all([
      fetchWorkExperience(),
      fetchProjectsFromPayload(),
      fetchProfile(),
      fetchEducation(),
      fetchResearch(),
      fetchCommunity(),
      fetchSkills(),
      fetchLanguages(),
      fetchCvPdf(),
    ]);

  const summary =
    (profile as unknown as { resume_summary?: string | null })?.resume_summary ??
    FALLBACK_SUMMARY;

  return (
    <>
      <BreadcrumbsJsonLd
        id="resume-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Resume", href: absoluteUrl("/resume") },
        ]}
      />

      {/* Top bar */}
      <div className="border-b border-border px-8 py-4 flex items-center justify-between gap-4">
        <p className="text-xs text-secondary">
          Open to full-time&nbsp;·&nbsp;Berlin&nbsp;·&nbsp;Remote
        </p>
        {cvPdf?.url ? (
          <a
            href={cvPdf.url}
            download
            className="text-2xs font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors duration-normal"
          >
            Download PDF ↓
          </a>
        ) : null}
      </div>

      {/* Summary */}
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Resume</h1>
        <p className="text-sm text-secondary leading-relaxed max-w-2xl">{summary}</p>
      </div>

      {/* Experience */}
      {work.length > 0 ? (
        <section aria-labelledby="resume-experience-heading">
          <SectionHeader>Experience</SectionHeader>
          {work.map((item) => (
            <ResumeEntry
              key={item.id}
              role={item.role}
              company={item.company}
              dates={item.date_range ?? null}
              summary={item.summary ?? null}
              contentHtml={item.contentHtml ?? null}
              tech={item.tech ?? null}
            />
          ))}
        </section>
      ) : null}

      {/* Projects */}
      {projects.length > 0 ? (
        <section aria-labelledby="resume-projects-heading">
          <SectionHeader>Projects</SectionHeader>
          {projects.map((project) => {
            const title = project.title ?? project.name;
            const tech = project.tech?.map((t) => ({ id: t.id, label: t.label })) ?? null;
            const isRealUrl = project.url && project.url !== "#";
            let companyLabel = "";
            if (isRealUrl) {
              try {
                const href = project.url!.startsWith("http") ? project.url! : `https://${project.url}`;
                companyLabel = new URL(href).hostname.replace(/^www\./, "");
              } catch {
                companyLabel = project.url ?? "";
              }
            }
            return (
              <ResumeEntry
                key={project.id}
                role={title}
                company={companyLabel}
                companyUrl={isRealUrl ? project.url : null}
                dates={project.year ?? null}
                summary={project.description ?? null}
                contentHtml={project.contentHtml ?? null}
                tech={tech}
              />
            );
          })}
        </section>
      ) : null}

      {/* Community */}
      {community.length > 0 ? (
        <section aria-labelledby="resume-community-heading">
          <SectionHeader>Community</SectionHeader>
          {community.map((item) => (
            <article key={item.id} className="border-b border-border px-6 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-primary">{item.role}</span>
                  <span className="text-xs text-muted">·</span>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-accent hover:text-accent-hover transition-colors duration-normal inline-flex items-center gap-1"
                    >
                      {item.name}
                      <ExternalLink size={10} className="shrink-0" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-xs font-medium text-accent">{item.name}</span>
                  )}
                </div>
                {(item.startDate || item.endDate) ? (
                  <span className="text-2xs tabular-nums text-muted shrink-0">
                    {[item.startDate, item.endDate ?? "present"].filter(Boolean).join("–")}
                  </span>
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-1 text-xs text-secondary leading-relaxed">{item.description}</p>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {/* Research */}
      {research.length > 0 ? (
        <section aria-labelledby="resume-research-heading">
          <SectionHeader>Research</SectionHeader>
          {research.map((item) => (
            <article key={item.id} className="border-b border-border px-6 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-primary">{item.title}</span>
                    {item.subtitle ? (
                      <>
                        <span className="text-xs text-muted">·</span>
                        <span className="text-xs text-secondary">{item.subtitle}</span>
                      </>
                    ) : null}
                  </div>
                  {item.institution ? (
                    <span className="text-xs text-muted">{item.institution}</span>
                  ) : null}
                </div>
                {item.year ? (
                  <span className="text-2xs tabular-nums text-muted shrink-0">{item.year}</span>
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-1.5 text-xs text-secondary leading-relaxed">{item.description}</p>
              ) : null}
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-2xs text-muted hover:text-primary transition-colors duration-normal"
                >
                  Read more
                  <ExternalLink size={10} aria-hidden="true" />
                </a>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {/* Skills */}
      {skills.length > 0 ? (
        <section aria-labelledby="resume-skills-heading">
          <SectionHeader>Skills</SectionHeader>
          <div className="px-6 py-5 flex flex-col gap-3">
            {skills.map((cat) => (
              <div key={cat.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                <span className="text-2xs font-mono uppercase tracking-widest text-muted w-28 shrink-0">
                  {cat.category}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(cat.items ?? []).map((item, i) => (
                    <span
                      key={item.id ?? `${item.name}-${i}`}
                      className="rounded border border-border bg-tag-bg px-2 py-0.5 text-2xs font-medium text-tag-text"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Education */}
      {education.length > 0 ? (
        <section aria-labelledby="resume-education-heading">
          <SectionHeader>Education</SectionHeader>
          {education.map((item) => (
            <article key={item.id} className="border-b border-border px-6 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-semibold text-primary">{item.degree}</span>
                  <span className="text-xs text-accent font-medium">{item.institution}</span>
                  {(item.location || item.note) ? (
                    <span className="text-xs text-muted">
                      {[item.location, item.note].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </div>
                {(item.startYear || item.endYear) ? (
                  <span className="text-2xs tabular-nums text-muted shrink-0">
                    {item.startYear && item.endYear
                      ? `${item.startYear}–${item.endYear}`
                      : item.startYear
                        ? `${item.startYear}–present`
                        : item.endYear ?? ""}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {/* Languages */}
      {languages.length > 0 ? (
        <section aria-labelledby="resume-languages-heading">
          <SectionHeader>Languages</SectionHeader>
          <div className="px-6 py-4">
            <p className="text-xs text-secondary">
              {languages
                .map((l) => `${l.language} (${l.level})`)
                .join(" · ")}
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
