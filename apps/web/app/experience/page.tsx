import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  fetchWorkExperience,
  type PayloadMedia,
} from "@/lib/data/cms";
import { renderMarkdown } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Experience",
  description: "Roles, responsibilities, and work highlights.",
};

export const dynamic = "force-static";

function resolveMediaUrl(
  media: PayloadMedia | number | null | undefined,
): PayloadMedia | null {
  if (!media || typeof media !== "object" || !media.url) return null;
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "";
  const resolvedUrl =
    media.url.startsWith("http") || !baseUrl ? media.url : `${baseUrl}${media.url}`;
  return {
    ...media,
    url: resolvedUrl,
  };
}

export default async function ExperiencePage() {
  const work = await fetchWorkExperience();

  if (!work || work.length === 0) return null;

  const entries = await Promise.all(
    work.map(async (item) => {
      let detail: ReactNode = null;

      if (item.markdownInput) {
        detail = await renderMarkdown(item.markdownInput);
      } else if (item.contentHtml) {
        detail = (
          <div
            className="flex flex-col gap-4 text-base text-secondary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: item.contentHtml }}
          />
        );
      }

      return { item, detail, logo: resolveMediaUrl(item.logo) };
    }),
  );

  return (
    <section className="flex flex-col gap-10 pb-24">
      <h2 className="text-3xl font-bold tracking-tight text-primary mt-24 mb-10">
        Experience
      </h2>
      <div className="flex flex-col gap-12">
        {entries.map(({ item, detail, logo }) => (
          <article key={item.id} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start gap-4">
              {logo ? (
                <Image
                  src={logo.url ?? ""}
                  alt={logo.alt ?? item.company}
                  width={logo.width ?? 48}
                  height={logo.height ?? 48}
                  className="h-12 w-12 object-cover"
                />
              ) : null}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-base font-medium text-primary">
                    {item.company}
                  </span>
                  {item.role ? (
                    <span className="text-base text-secondary">
                      {item.role}
                    </span>
                  ) : null}
                  {item.date_range ? (
                    <span className="text-base text-muted">
                      {item.date_range}
                    </span>
                  ) : null}
                </div>
                {item.tech_stack ? (
                  <p className="text-base text-muted">
                    Tech: {item.tech_stack}
                  </p>
                ) : null}
              </div>
            </div>

            {item.bullets?.length ? (
              <ul className="list-disc pl-5 text-base text-secondary">
                {item.bullets.map((bullet) => (
                  <li key={bullet.id}>
                    {bullet.href ? (
                      <a
                        href={bullet.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {bullet.label}
                      </a>
                    ) : (
                      bullet.label
                    )}
                  </li>
                ))}
              </ul>
            ) : null}

            {detail ? <div className="flex flex-col gap-4">{detail}</div> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
