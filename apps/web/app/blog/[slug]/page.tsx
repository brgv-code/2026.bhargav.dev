import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { RichText } from "@/components/rich-text";
import {
  BlogPostBackLink,
  BlogPostTags,
  BlogPostTitle,
  BlogPostSubtitle,
  BlogPostDivider,
  BlogPostReadingMeta,
  BlogPostFooter,
  BlogPostTOC,
  BlogPostFurtherReading,
} from "@/components/blog";
import { fetchPostBySlug, fetchRelatedPosts, type PayloadTocItem } from "@/lib/payload";

type Props = {
  params: Promise<{ slug: string }>;
};

const BLOG_INDEX_HREF = "/blog";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description ?? undefined,
  };
}

function normalizeTags(
  tags: { id: number; name: string; slug: string }[] | null | undefined
): { id: number; name: string; slug: string }[] | null {
  if (!tags?.length) return null;
  return tags.filter(
    (t): t is { id: number; name: string; slug: string } =>
      typeof t === "object" && t != null && "name" in t && typeof t.name === "string"
  );
}

function normalizeTocItems(
  raw: unknown
): PayloadTocItem[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: PayloadTocItem[] = [];
  for (const x of raw) {
    if (
      typeof x === "object" &&
      x != null &&
      "id" in x &&
      "text" in x &&
      typeof (x as PayloadTocItem).id === "string" &&
      typeof (x as PayloadTocItem).text === "string"
    ) {
      out.push({
        id: (x as PayloadTocItem).id,
        text: (x as PayloadTocItem).text,
        level: typeof (x as PayloadTocItem).level === "number" ? (x as PayloadTocItem).level : 2,
      });
    }
  }
  return out.length ? out : null;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const tags = normalizeTags(post.tags);
  const relatedPosts = await fetchRelatedPosts(post.slug, 4);
  const tocItems = normalizeTocItems(post.tocItems);

  return (
    <>
      <Navbar />
      <div data-theme="editorial" className="min-h-screen bg-[var(--editorial-bg)]">
        <div className="max-w-[1060px] mx-auto px-6 sm:px-10 pt-28 pb-16 text-[var(--editorial-text)]">
          <BlogPostBackLink href={BLOG_INDEX_HREF} />
          <article>
            <BlogPostTags tags={tags} />
            <BlogPostTitle title={post.title} />
            <BlogPostSubtitle description={post.description} />
            <BlogPostDivider />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-x-12 lg:gap-x-20 gap-y-8">
              <main className="min-w-0">
                <BlogPostReadingMeta
                  date={post.publishedAt ?? post.updatedAt ?? post.createdAt ?? undefined}
                  readingTimeMinutes={post.readingTime ?? undefined}
                  wordCount={post.wordCount ?? undefined}
                />
                <div className="mt-6">
                  <RichText
                    data={post.content as SerializedEditorState | null | undefined}
                    className="prose-editorial max-w-none"
                    headingIds={tocItems?.map((t) => t.id)}
                  />
                </div>
              </main>
              <aside className="lg:sticky lg:top-[78px] lg:self-start flex flex-col gap-8">
                <BlogPostTOC items={tocItems} />
                <BlogPostFurtherReading posts={relatedPosts} />
              </aside>
            </div>
          </article>
        </div>
        <BlogPostFooter className="mt-12 w-full" />
      </div>
    </>
  );
}
