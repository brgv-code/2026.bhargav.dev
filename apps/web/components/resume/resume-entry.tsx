"use client";

type TechTag = { id?: string; label: string };

type ResumeEntryProps = {
  role: string;
  company: string;
  companyUrl?: string | null;
  dates?: string | null;
  summary?: string | null;
  contentHtml?: string | null;
  tech?: TechTag[] | null;
};

export function ResumeEntry({
  role,
  company,
  companyUrl,
  dates,
  summary,
  contentHtml,
  tech,
}: ResumeEntryProps) {
  const hasDetail = Boolean(contentHtml);

  return (
    <details className="group border-b border-border">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-6 py-5 marker:hidden [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-primary leading-snug">
              {role}
            </span>
            <span className="text-xs text-muted">·</span>
            {companyUrl ? (
              <a
                href={companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors duration-normal"
              >
                {company}
              </a>
            ) : (
              <span className="text-xs font-medium text-accent">{company}</span>
            )}
          </div>
          {summary ? (
            <p className="text-xs text-secondary leading-relaxed">{summary}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {dates ? (
            <span className="text-2xs tabular-nums text-muted">{dates}</span>
          ) : null}
          {hasDetail ? (
            <span className="text-xs text-muted transition-transform duration-normal group-open:rotate-45">
              +
            </span>
          ) : null}
        </div>
      </summary>

      {hasDetail ? (
        <div className="px-6 pb-5">
          {contentHtml ? (
            <div
              className="article-prose text-xs leading-relaxed text-secondary"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : null}
          {tech && tech.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tech.map((t, i) => (
                <span
                  key={t.id ?? `${t.label}-${i}`}
                  className="rounded border border-border bg-tag-bg px-2 py-0.5 text-2xs font-medium text-tag-text"
                >
                  {t.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </details>
  );
}
