import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { ReactNode } from "react";
import {
  fetchPostBySlug,
  fetchPostSlugs,
  type PayloadMedia,
} from "@/lib/data/cms";
import { formatPostDate, formatReadTime } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { RichText } from "@/components/shared/rich-text";

export const dynamic = "force-static";
export const dynamicParams = false;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await fetchPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return { title: "Writing not found" };
  }

  return {
    title: post.title,
    description: post.description ?? undefined,
  };
}

function resolveCoverImage(
  media: PayloadMedia | number | null | undefined,
): PayloadMedia | null {
  if (!media || typeof media !== "object") return null;
  if (!media.url) return null;
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "";
  const resolvedUrl =
    media.url.startsWith("http") || !baseUrl ? media.url : `${baseUrl}${media.url}`;
  return {
    ...media,
    url: resolvedUrl,
  };
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) notFound();

  const dateLabel = formatPostDate(
    post.publishedAt ?? post.createdAt ?? post.updatedAt,
  );
  const readTime = formatReadTime(post.readingTime);
  const cover = resolveCoverImage(post.coverImage);

  let body: ReactNode = null;
  if (post.markdownInput) {
    body = await renderMarkdown(post.markdownInput);
  } else if (post.contentHtml) {
    body = (
      <div
        className="flex flex-col gap-6 text-base text-secondary leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    );
  } else if (post.content) {
    body = (
      <RichText
        data={post.content as SerializedEditorState | null | undefined}
        className="flex flex-col gap-6"
      />
    );
  }

  return (
    <article className="flex flex-col gap-10 pb-24">
      <header className="flex flex-col gap-4">
        <div className="text-base text-muted">
          {[dateLabel, readTime].filter(Boolean).join(" / ")}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-primary">
          {post.title}
        </h1>
        {post.description ? (
          <p className="text-base text-secondary">{post.description}</p>
        ) : null}
      </header>

      {cover ? (
        <div className="w-full">
          <Image
            src={cover.url ?? ""}
            alt={cover.alt ?? post.title}
            width={cover.width ?? 1600}
            height={cover.height ?? 900}
            sizes="100vw"
            className="h-auto w-full"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {body ?? (
          <p className="text-base text-muted">Content coming soon.</p>
        )}
      </div>
    </article>
  );
}
