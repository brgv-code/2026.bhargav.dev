import type { Metadata } from "next";
import { Download, ExternalLink } from "lucide-react";
import {
  fetchWorkExperience,
  fetchProjectsFromPayload,
  fetchProfile,
  fetchEducation,
  fetchSkills,
  fetchLanguages,
  fetchCommunity,
  fetchResearch,
  fetchCvPdf,
} from "@/lib/data/cms";
import { absoluteUrl, siteName } from "@/lib/seo";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";

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

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <p className="text-xs uppercase tracking-widest text-muted mb-5">{label}</p>
      {children}
    </section>
  );
}

export default async function ResumePage() {
  const [work, projects, profile, education, skills, languages, community, research, cvPdf] =
    await Promise.all([
      fetchWorkExperience(),
      fetchProjectsFromPayload(),
      fetchProfile(),
      fetchEducation(),
      fetchSkills(),
      fetchLanguages(),
      fetchCommunity(),
      fetchResearch(),
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

      <div className="mx-auto max-w-3xl px-8 py-16">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">
              Open to full-time · Berlin · Remote
            </p>
            <h1 className="mt-3 font-serif text-5xl font-black tracking-tight text-primary">
              Resume
            </h1>
          </div>
          {cvPdf?.url && (
            <a
              href={cvPdf.url}
              download
              className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-2 text-xs uppercase tracking-wider text-muted hover:border-border-strong hover:text-primary transition-colors shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </a>
          )}
        </div>

        <p className="mt-4 text-lg text-secondary font-serif leading-relaxed max-w-prose">
          {summary}
        </p>

        {/* Experience */}
        {work.length > 0 && (
          <Section label="Experience">
            <div className="space-y-4">
              {work.map((job) => (
                <article
                  key={job.id}
                  className="rounded border border-border bg-surface p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl font-bold tracking-tight text-primary">
                        {job.role}
                        <span className="text-muted font-normal"> · {job.company}</span>
                      </h3>
                      {job.summary && (
                        <p className="mt-1 text-sm text-muted">{job.summary}</p>
                      )}
                    </div>
                    {job.date_range && (
                      <span className="text-xs text-muted tabular-nums shrink-0 pt-1">
                        {job.date_range}
                      </span>
                    )}
                  </div>
                  {job.bullets && job.bullets.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {job.bullets.map((b) => (
                        <li key={b.id} className="flex gap-2 text-sm text-secondary leading-relaxed">
                          <span className="text-muted mt-2 h-px w-3 shrink-0 bg-current" />
                          <span>{b.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {(!job.bullets || job.bullets.length === 0) && job.contentHtml && (
                    <div
                      className="mt-4 article-prose text-sm"
                      dangerouslySetInnerHTML={{ __html: job.contentHtml }}
                    />
                  )}
                  {job.tech && job.tech.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.tech.map((t) => (
                        <span
                          key={t.id}
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border text-muted"
                        >
                          {t.label}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </Section>
        )}

        {/* Selected Projects */}
        {projects.length > 0 && (
          <Section label="Selected Projects">
            <div className="divide-y divide-border">
              {projects.map((p) => {
                const title = p.title ?? p.name;
                const isRealUrl = p.url && p.url !== "#";
                let hostname = "";
                if (isRealUrl) {
                  try {
                    hostname = new URL(p.url!.startsWith("http") ? p.url! : `https://${p.url}`).hostname.replace(/^www\./, "");
                  } catch {
                    hostname = p.url ?? "";
                  }
                }
                return (
                  <div key={p.id} className="flex items-baseline gap-3 py-3 flex-wrap">
                    <span className="font-serif text-base font-bold text-primary">{title}</span>
                    {isRealUrl && (
                      <a
                        href={p.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted hover:text-primary inline-flex items-center gap-1 transition-colors"
                      >
                        {hostname}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {p.description && (
                      <span className="text-sm text-secondary flex-1">— {p.description}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Section label="Skills">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {skills.map((cat) => (
                <div key={cat.id}>
                  <p className="text-xs uppercase tracking-wider text-muted">{cat.category}</p>
                  <p className="mt-1.5 text-sm text-secondary leading-relaxed">
                    {(cat.items ?? []).map((item) => item.name).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Community */}
        {community.length > 0 && (
          <Section label="Community">
            <div className="divide-y divide-border">
              {community.map((item) => (
                <div key={item.id} className="py-3">
                  <span className="font-serif text-base font-bold text-primary">{item.role}</span>
                  {" · "}
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1">
                      {item.name}<ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-sm text-secondary">{item.name}</span>
                  )}
                  {item.description && (
                    <p className="text-sm text-muted mt-0.5">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Research */}
        {research.length > 0 && (
          <Section label="Research">
            <div className="divide-y divide-border">
              {research.map((item) => (
                <div key={item.id} className="py-3">
                  <span className="font-serif text-base font-bold text-primary">{item.title}</span>
                  {item.institution && (
                    <p className="text-sm text-muted mt-0.5">{item.institution}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Section label="Education">
            <div className="space-y-4">
              {education.map((e) => (
                <div key={e.id}>
                  <p className="font-serif text-base font-bold text-primary">{e.institution}</p>
                  <p className="text-sm text-muted">{e.degree}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <Section label="Languages">
            <p className="text-sm text-secondary">
              {languages.map((l) => `${l.language} (${l.level})`).join(" · ")}
            </p>
          </Section>
        )}
      </div>
    </>
  );
}
